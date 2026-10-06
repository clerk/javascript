import { randomBytes, timingSafeEqual } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import { isConflict, newTestEmail, parseTestPhone, type ClerkBackend } from './clerk.ts';
import { encodeLaunchArguments } from './state.ts';
import { newEntryId, type Workspace } from './workspace.ts';
import {
  AUTH_MODES,
  VerifyFailure,
  type BrokerLaunchRequest,
  type BrokerLaunchResponse,
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
  readonly screens: readonly string[];
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

  function reserve(): TestEmail {
    emails += 1;
    const email = newTestEmail(run, emails);
    workspace.append({ id: newEntryId(), kind: 'identity', run, email });
    return email;
  }

  async function seedUser(wantsPhone: boolean): Promise<SeededUser> {
    const clerk = deps.clerk();
    const email = reserve();
    const first = Math.floor(Math.random() * 100);
    for (let i = 0; i < (wantsPhone ? 100 : 1); i += 1) {
      const phone: TestPhone | null = wantsPhone ? parseTestPhone(`+1201555${String(100 + ((first + i) % 100)).padStart(4, '0')}`) : null;
      try {
        const user = await clerk.createUser(email, phone);
        workspace.append({ id: newEntryId(), kind: 'user', run, userId: user.id, email });
        users.set(user.id, user);
        return user;
      } catch (error) {
        if (!(wantsPhone && isConflict(error))) throw error;
      }
    }
    throw new VerifyFailure('INSTANCE_MISCONFIGURED', 'every 555-0100..0199 test phone is taken on this instance', "{cli} down deletes this worktree's test instance with its users; then rerun, or seed without a phone");
  }

  async function launch(request: BrokerLaunchRequest): Promise<BrokerLaunchResponse> {
    if (!deps.platforms.includes(request.platform)) {
      throw new VerifyFailure('USAGE', `this run drives ${deps.platforms.join(', ')}, not ${String(request.platform)}`, 'launch from a spec that this run selected');
    }
    if (request.screen !== null && !deps.screens.includes(request.screen)) {
      throw new VerifyFailure('USAGE', `unknown screen ${request.screen}`, `use one of ${deps.screens.join(', ')}`);
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
      ...(request.screen === null ? {} : { verifyScreen: request.screen }),
      ...(request.authMode === null ? {} : { verifyAuthMode: request.authMode }),
      ...(request.debugLogs ? { verifyLogLevel: 'debug' as const } : {}),
      ...(ticket === undefined ? {} : { verifySignInTicket: ticket }),
    });
    return { launchId, storageScope: scope, launchArguments };
  }

  const routes: Readonly<Record<string, (body: Record<string, unknown>) => Promise<unknown>>> = {
    '/seedUser': (body) => seedUser(body.phone === true),
    '/reserveEmail': async () => ({ email: reserve() }),
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
