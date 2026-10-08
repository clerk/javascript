import { randomBytes, timingSafeEqual } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import { BACKEND_API_URL, BACKEND_CALLS, TICKET_SECONDS, parseTestEmail, parseTestPhone, runEmailPrefix, typedPassword, type BackendCall } from '../../specs/support/clerk.ts';
import { protect } from '../../specs/support/secret.ts';
import { ownKeyRefused, userLimitReached } from './clerk.ts';
import type { InstanceKeys } from './keys.ts';
import { newEntryId, type Workspace } from './workspace.ts';
import { VerifyFailure, type RunId, type ScratchPath, type TestEmail } from './types.ts';

export const STAND_IN_PATH = '/v1';

const BODY_LIMIT_BYTES = 64 * 1024;

export interface BrokerDeps {
  readonly keys: () => InstanceKeys;
  readonly fetch: typeof fetch;
}

export interface Broker {
  readonly url: string;
  readonly tokenFile: string;
  stop(): Promise<void>;
}

interface Asked {
  readonly query: URLSearchParams;
  readonly body: Readonly<Record<string, unknown>>;
}

interface Guard {
  refuses(asked: Asked): string | null;
  forwards(asked: Asked): Asked;
  answered?(asked: Asked, reply: unknown): unknown;
}

const NO_QUERY = new URLSearchParams();

interface Answer {
  readonly status: number;
  readonly body: string;
}

const clerkError = (status: number, code: string, message: string): Answer => ({ status, body: JSON.stringify({ errors: [{ code, message, long_message: message }] }) });

const refused = (why: string): Answer => clerkError(403, 'verify_stand_in_refused', `the verify CLI's stand-in for the Backend API refused this request: ${why}`);

const failure = (status: number, code: string, error: VerifyFailure): Answer => clerkError(status, code, `${error.message} (fix: ${error.fix})`);

const onlyKeys = (given: Readonly<Record<string, unknown>> | URLSearchParams, allowed: readonly string[]): string | null => {
  const extra = [...(given instanceof URLSearchParams ? given.keys() : Object.keys(given))].filter((key) => !allowed.includes(key));
  return extra.length === 0 ? null : `it carries ${extra.join(', ')}, and the tests send only ${allowed.join(', ')}`;
};

const notOurs = (check: () => unknown): string | null => {
  try {
    check();
    return null;
  } catch (error) {
    return (error as Error).message;
  }
};

export async function startBroker(run: RunId, workspace: Workspace, scratch: ScratchPath, deps: BrokerDeps): Promise<Broker> {
  const token = randomBytes(32).toString('hex');
  protect(token);
  const tokenFile = join(scratch, 'broker-token');
  writeFileSync(tokenFile, token, { mode: 0o600 });
  const created = new Set<string>();
  const prefix = runEmailPrefix(run);

  const guards: Record<BackendCall, Guard> = {
    createUser: {
      refuses({ body }) {
        const emails = body.email_address;
        if (!Array.isArray(emails) || emails.length !== 1 || typeof emails[0] !== 'string') return 'a user is created with exactly one email address';
        const email: string = emails[0];
        const phones = body.phone_number === undefined ? [] : body.phone_number;
        if (!Array.isArray(phones) || phones.some((phone) => typeof phone !== 'string')) return 'phone_number is not a list of phone numbers';
        return (
          onlyKeys(body, ['email_address', 'phone_number', 'password', 'skip_password_requirement', 'bypass_client_trust']) ??
          notOurs(() => parseTestEmail(email)) ??
          (email.startsWith(prefix) ? null : `${email} is not an address of run ${run}, whose addresses start ${prefix}`) ??
          phones.map((phone: string) => notOurs(() => parseTestPhone(phone))).find((problem) => problem !== null) ??
          null
        );
      },
      forwards: ({ body }) => ({ query: NO_QUERY, body: body.phone_number === undefined ? body : { ...body, phone_number: (body.phone_number as string[]).map(parseTestPhone) } }),
      answered({ body }, reply) {
        if (typeof body.password === 'string') typedPassword(body.password);
        const userId = (reply as { id?: unknown } | null)?.id;
        if (typeof userId === 'string') {
          created.add(userId);
          workspace.append({ id: newEntryId(), kind: 'user', run, userId, email: (body.email_address as [TestEmail])[0] });
        }
        return reply;
      },
    },
    signInToken: {
      refuses({ body }) {
        const { user_id: userId, expires_in_seconds: seconds } = body;
        if (typeof userId !== 'string' || !created.has(userId)) return `user ${String(userId)} was not created by this run; sign in only users from host.seedUser`;
        if (typeof seconds !== 'number' || !(seconds > 0 && seconds <= TICKET_SECONDS)) return `a sign-in ticket lives ${TICKET_SECONDS} seconds at most`;
        return onlyKeys(body, ['user_id', 'expires_in_seconds']);
      },
      forwards: ({ body }) => ({ query: NO_QUERY, body }),
      answered(_asked, reply) {
        const ticket = (reply as { token?: unknown } | null)?.token;
        if (typeof ticket === 'string') protect(ticket);
        return reply;
      },
    },
    usersByPhone: {
      refuses({ query }) {
        const phones = query.getAll('phone_number');
        if (phones.length !== 1) return 'users are looked up by one test phone';
        return onlyKeys(query, ['phone_number']) ?? notOurs(() => parseTestPhone(phones[0]!));
      },
      forwards: ({ query }) => ({ query: new URLSearchParams({ phone_number: parseTestPhone(query.get('phone_number')!) }), body: {} }),
      answered: (_asked, reply) => (Array.isArray(reply) ? reply.flatMap((user: { id?: unknown } | null) => (typeof user?.id === 'string' ? [{ id: user.id }] : [])) : reply),
    },
  };

  const guardFor = (method: string | undefined, path: string): Guard | undefined => {
    const call = (Object.keys(BACKEND_CALLS) as BackendCall[]).find((name) => BACKEND_CALLS[name].method === method && `${STAND_IN_PATH}${BACKEND_CALLS[name].path}` === path);
    return call === undefined ? undefined : guards[call];
  };

  async function forward(method: string, path: string, { query, body }: Asked): Promise<Answer> {
    const response = await deps.keys().sk.use('bapi-authorization', (plain) =>
      deps.fetch(`${BACKEND_API_URL}${path.slice(STAND_IN_PATH.length)}${query.size === 0 ? '' : `?${query}`}`, {
        method,
        headers: { Authorization: `Bearer ${plain}`, 'Content-Type': 'application/json' },
        ...(method === 'GET' ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(30_000),
      }),
    );
    return { status: response.status, body: await response.text() };
  }

  async function answer(request: IncomingMessage): Promise<Answer> {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const guard = guardFor(request.method, url.pathname);
    if (guard === undefined) return clerkError(404, 'verify_stand_in_unknown_call', `the verify CLI's stand-in for the Backend API has no ${request.method} ${url.pathname}; the tests make ${Object.values(BACKEND_CALLS).map((call) => `${call.method} ${call.path}`).join(', ')}`);
    let text = '';
    for await (const chunk of request) {
      text += chunk;
      if (text.length > BODY_LIMIT_BYTES) return refused('its body is larger than any request the tests make');
    }
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = text.length > 0 ? JSON.parse(text) : {};
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return refused('its body is not a JSON object');
      body = parsed as Record<string, unknown>;
    } catch {
      return refused('its body is not JSON');
    }
    const asked: Asked = { query: url.searchParams, body };
    const why = guard.refuses(asked);
    if (why !== null) return refused(why);
    const reply = await forward(request.method ?? 'GET', url.pathname, guard.forwards(asked));
    if (reply.status === 401) return failure(401, 'verify_stand_in_key_refused', ownKeyRefused());
    let json: unknown;
    try {
      json = reply.body.length > 0 ? JSON.parse(reply.body) : null;
    } catch {
      return reply;
    }
    if (reply.status < 200 || reply.status >= 300) {
      const codes = ((json as { errors?: { code?: string }[] } | null)?.errors ?? []).map((error) => error.code);
      return reply.status === 403 && codes.includes('user_quota_exceeded') ? failure(403, 'user_quota_exceeded', userLimitReached()) : reply;
    }
    return { status: reply.status, body: JSON.stringify(guard.answered?.(asked, json) ?? json) };
  }

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const auth = Buffer.from(request.headers.authorization ?? '');
    const expected = Buffer.from(`Bearer ${token}`);
    if (auth.length !== expected.length || !timingSafeEqual(auth, expected)) {
      response.writeHead(401).end();
      return;
    }
    const sent = await answer(request).catch((error: unknown) => clerkError(502, 'verify_stand_in_failed', `the verify CLI's stand-in for the Backend API could not forward this request: ${(error as Error).message ?? String(error)}`));
    response.writeHead(sent.status, { 'Content-Type': 'application/json' }).end(sent.body);
  }

  const server = createServer((request, response) => void handle(request, response));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('broker did not bind a TCP port');
  return {
    url: `http://127.0.0.1:${address.port}${STAND_IN_PATH}`,
    tokenFile,
    stop: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
