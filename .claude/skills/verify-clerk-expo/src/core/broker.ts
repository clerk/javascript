import { randomBytes, timingSafeEqual } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import { TEST_PHONES, isConflict, newTestEmail, newTestPassword, type ClerkBackend } from './clerk.ts';
import { encodeLaunchArguments } from './state.ts';
import { newEntryId, type Workspace } from './workspace.ts';
import {
  AUTH_MODES,
  VerifyFailure,
  type BrokerLaunchRequest,
  type BrokerLaunchResponse,
  type BrokerSeedRequest,
  type BrokerSeedResponse,
  type LaunchId,
  type Platform,
  type PublishableKey,
  type RunId,
  type ScratchPath,
  type SeededUser,
  type StorageScope,
  type TestEmail,
  type TestPhone,
} from './types.ts';

const TICKET_SECONDS = 120;

export interface BrokerDeps {
  readonly clerk: () => ClerkBackend;
  readonly publishableKey: () => PublishableKey;
  readonly platforms: readonly Platform[];
}

export interface Broker {
  readonly url: string;
  readonly tokenFile: string;
  stop(): Promise<void>;
}

const randomId = (bytes: number) => randomBytes(bytes).toString('hex');

export async function startBroker(run: RunId, workspace: Workspace, scratch: ScratchPath, deps: BrokerDeps): Promise<Broker> {
  const token = randomId(32);
  const tokenFile = join(scratch, 'broker-token');
  writeFileSync(tokenFile, token, { mode: 0o600 });
  const users = new Map<string, SeededUser>();
  let emails = workspace.entries().filter((e) => e.kind === 'identity' && e.run === run).length;
  const reservedPhones = new Set(workspace.entries().flatMap((e) => (e.kind === 'phone' && e.run === run ? [e.phone] : [])));

  function reserve(): TestEmail {
    emails += 1;
    const email = newTestEmail(run, emails);
    workspace.append({ id: newEntryId(), kind: 'identity', run, email });
    return email;
  }

  function phonesNotReserved(): readonly TestPhone[] {
    const first = Math.floor(Math.random() * TEST_PHONES.length);
    return TEST_PHONES.map((_, i) => TEST_PHONES[(first + i) % TEST_PHONES.length]!).filter((phone) => !reservedPhones.has(phone));
  }

  const everyPhoneTaken = (otherwise: string): VerifyFailure =>
    new VerifyFailure('INSTANCE_MISCONFIGURED', 'every 555-0100..0199 test phone is taken on this instance', `{cli} down deletes this worktree's test instance with its users; then rerun${otherwise}`);

  async function reservePhone(): Promise<TestPhone> {
    const clerk = deps.clerk();
    for (const phone of phonesNotReserved()) {
      if (await clerk.phoneTaken(phone)) continue;
      reservedPhones.add(phone);
      workspace.append({ id: newEntryId(), kind: 'phone', run, phone });
      return phone;
    }
    throw everyPhoneTaken('');
  }

  async function seedUser(wants: BrokerSeedRequest): Promise<BrokerSeedResponse> {
    const clerk = deps.clerk();
    const email = reserve();
    const password = wants.password ? newTestPassword() : null;
    for (const phone of wants.phone ? phonesNotReserved() : [null]) {
      try {
        const user = await clerk.createUser(email, phone, password);
        workspace.append({ id: newEntryId(), kind: 'user', run, userId: user.id, email });
        users.set(user.id, user);
        return { ...user, password: password?.use('broker-response', (plain) => plain) ?? null };
      } catch (error) {
        if (!(phone !== null && isConflict(error))) throw error;
      }
    }
    throw everyPhoneTaken(', or seed without a phone');
  }

  async function launch(request: BrokerLaunchRequest): Promise<BrokerLaunchResponse> {
    if (!deps.platforms.includes(request.platform)) {
      throw new VerifyFailure('USAGE', `this run drives ${deps.platforms.join(', ')}, not ${String(request.platform)}`, 'launch from a spec that this run selected');
    }
    if (request.authMode !== null && !AUTH_MODES.includes(request.authMode)) {
      throw new VerifyFailure('USAGE', `unknown auth mode ${request.authMode}`, `use one of ${AUTH_MODES.join(', ')}`);
    }
    let ticket;
    if (request.user !== null) {
      const user = users.get(request.user.id);
      if (user === undefined) throw new VerifyFailure('NOT_TEST_IDENTITY', `user ${request.user.id} was not seeded by this run`, 'sign in only users from host.seedUser');
      ticket = await deps.clerk().mintTicket(user, TICKET_SECONDS);
    }
    const scope = request.storageScope ?? (randomId(8) as StorageScope);
    const launchId = randomId(8) as LaunchId;
    const launchArguments = encodeLaunchArguments(request.platform, {
      verifyPublishableKey: deps.publishableKey(),
      verifyRunId: run,
      verifyStorageScope: scope,
      verifyLaunchId: launchId,
      ...(request.authMode === null ? {} : { verifyAuthMode: request.authMode }),
      ...(request.initialIdentifier === null ? {} : { verifyInitialIdentifier: request.initialIdentifier }),
      ...(request.debugLogs ? { verifyLogLevel: 'debug' as const } : {}),
      ...(ticket === undefined ? {} : { verifySignInTicket: ticket }),
    });
    return { launchId, storageScope: scope, launchArguments };
  }

  const routes: Readonly<Record<string, (body: Record<string, unknown>) => Promise<unknown>>> = {
    '/seedUser': (body) => seedUser({ phone: body.phone === true, password: body.password === true }),
    '/reserveEmail': async () => ({ email: reserve() }),
    '/reservePhone': async () => ({ phone: await reservePhone() }),
    '/launch': (body) => launch(body as unknown as BrokerLaunchRequest),
  };

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const auth = Buffer.from(request.headers.authorization ?? '');
    const expected = Buffer.from(`Bearer ${token}`);
    if (auth.length !== expected.length || !timingSafeEqual(auth, expected)) {
      response.writeHead(401).end();
      return;
    }
    const route = request.method === 'POST' ? routes[request.url ?? ''] : undefined;
    if (route === undefined) {
      response.writeHead(404).end();
      return;
    }
    let text = '';
    for await (const chunk of request) text += chunk;
    try {
      const body = text.length > 0 ? (JSON.parse(text) as Record<string, unknown>) : {};
      const result = await route(body);
      response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(result));
    } catch (error) {
      const failure = error instanceof VerifyFailure ? error : new VerifyFailure('NOT_READY', (error as Error).message, 'see e2e.log');
      response.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ code: failure.code, message: failure.message, fix: failure.fix }));
    }
  }

  const server = createServer((request, response) => void handle(request, response));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('broker did not bind a TCP port');
  return {
    url: `http://127.0.0.1:${address.port}`,
    tokenFile,
    stop: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
