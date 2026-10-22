import { randomBytes, timingSafeEqual } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import {
  ABOUT_TO_LAUNCH,
  BACKEND_API_URL,
  BACKEND_CALLS,
  HARNESS_ROLES,
  PATH_PARAM,
  SYSTEM_PERMISSIONS,
  TICKET_SECONDS,
  backendPath,
  isHarnessRole,
  isOrganizationNameOf,
  isTestDomainOf,
  isTestEmailOf,
  parseTestEmail,
  parseTestPhone,
  typedPassword,
  type BackendCall,
} from '../../specs/support/clerk.ts';
import { runIdParts } from '../../specs/support/inputs.ts';
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
  readonly beforeLaunch: () => Promise<void>;
}

export interface Broker {
  readonly url: string;
  readonly tokenFile: string;
  stop(): Promise<void>;
}

interface Asked {
  readonly params: Readonly<Record<string, string>>;
  readonly query: URLSearchParams;
  readonly body: Readonly<Record<string, unknown>>;
}

interface Guard {
  refuses(asked: Asked): string | null | Promise<string | null>;
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

const listOf = (reply: unknown): readonly Record<string, unknown>[] => {
  const data = (reply as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? data : [];
};

const listed = (reply: unknown, fields: (item: Record<string, unknown>) => Record<string, unknown>): unknown => ({ data: listOf(reply).map(fields), total_count: (reply as { total_count?: unknown } | null)?.total_count });

const idAndKey = (item: Record<string, unknown>): Record<string, unknown> => ({ id: item.id, key: item.key });

const CUSTOM_ROLES = Object.entries(HARNESS_ROLES).flatMap(([key, role]) => (role === null ? [] : [key]));

const notOurs = (check: () => unknown): string | null => {
  try {
    check();
    return null;
  } catch (error) {
    return (error as Error).message;
  }
};

function paramsOf(template: string, path: string): Readonly<Record<string, string>> | null {
  const names: string[] = [];
  const pattern = template.replace(PATH_PARAM, (_, name: string) => {
    names.push(name);
    return '([A-Za-z0-9_]+)';
  });
  const match = new RegExp(`^${STAND_IN_PATH}${pattern}$`).exec(path);
  return match === null ? null : Object.fromEntries(names.map((name, index) => [name, match[index + 1]!]));
}

export async function startBroker(run: RunId, workspace: Workspace, scratch: ScratchPath, deps: BrokerDeps): Promise<Broker> {
  const token = randomBytes(32).toString('hex');
  protect(token);
  const tokenFile = join(scratch, 'broker-token');
  writeFileSync(tokenFile, token, { mode: 0o600 });
  const created = new Set<string>();
  const organizations = new Set<string>();
  const { tag } = runIdParts(run);

  const ourUser = (userId: unknown, what: string): string | null => (typeof userId === 'string' && created.has(userId) ? null : `user ${String(userId)} was not created by this run; ${what} only users from host.seedUser`);
  const ourOrganization = ({ params }: Asked): string | null => (organizations.has(params.organization_id ?? '') ? null : `organization ${params.organization_id} was not created by this run; seed it with host.seedOrganization`);
  const asSent = ({ body }: Asked): Asked => ({ params: {}, query: NO_QUERY, body });

  async function systemPermissionKeys(): Promise<ReadonlyMap<string, string>> {
    const reply = await forward('GET', `${STAND_IN_PATH}${backendPath('listPermissions')}`, { params: {}, query: new URLSearchParams(SYSTEM_PERMISSIONS), body: {} });
    if (reply.status < 200 || reply.status >= 300) throw new Error(`Clerk answered ${reply.status} to the list of permissions`);
    return new Map(listOf(JSON.parse(reply.body)).map((permission) => [String(permission.id), String(permission.key)]));
  }

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
          (isTestEmailOf(run, email) ? null : `${email} is not an address of run ${run}, whose addresses are a name, then .${tag}+clerk_test@`) ??
          phones.map((phone: string) => notOurs(() => parseTestPhone(phone))).find((problem) => problem !== null) ??
          null
        );
      },
      forwards: ({ body }) => ({ params: {}, query: NO_QUERY, body: body.phone_number === undefined ? body : { ...body, phone_number: (body.phone_number as string[]).map(parseTestPhone) } }),
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
        return (
          ourUser(userId, 'sign in') ??
          (typeof seconds === 'number' && seconds > 0 && seconds <= TICKET_SECONDS ? null : `a sign-in ticket lives ${TICKET_SECONDS} seconds at most`) ??
          onlyKeys(body, ['user_id', 'expires_in_seconds'])
        );
      },
      forwards: asSent,
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
      forwards: ({ query }) => ({ params: {}, query: new URLSearchParams({ phone_number: parseTestPhone(query.get('phone_number')!) }), body: {} }),
      answered: (_asked, reply) => (Array.isArray(reply) ? reply.flatMap((user: { id?: unknown } | null) => (typeof user?.id === 'string' ? [{ id: user.id }] : [])) : reply),
    },
    createOrganization: {
      refuses({ body }) {
        const { name, created_by: creator } = body;
        return (
          onlyKeys(body, ['name', 'created_by']) ??
          ourUser(creator, 'an organization is created by') ??
          (typeof name === 'string' && isOrganizationNameOf(run, name) ? null : `${String(name)} is not an organization name of run ${run}, whose organization names are a capitalized word, a space, and ${tag}`)
        );
      },
      forwards: asSent,
      answered(_asked, reply) {
        const id = (reply as { id?: unknown } | null)?.id;
        if (typeof id === 'string') organizations.add(id);
        return reply;
      },
    },
    createMembership: {
      refuses(asked) {
        const { user_id: userId, role } = asked.body;
        return (
          ourOrganization(asked) ??
          onlyKeys(asked.body, ['user_id', 'role']) ??
          ourUser(userId, 'an organization takes as members') ??
          (isHarnessRole(role) ? null : `${String(role)} is not a role the tests give; they give ${Object.keys(HARNESS_ROLES).join(', ')}`)
        );
      },
      forwards: asSent,
    },
    createDomain: {
      refuses(asked) {
        const { name, enrollment_mode: mode, verified } = asked.body;
        return (
          ourOrganization(asked) ??
          onlyKeys(asked.body, ['name', 'enrollment_mode', 'verified']) ??
          (typeof name === 'string' && isTestDomainOf(run, name) ? null : `${String(name)} is not a domain of run ${run}, whose domains are a lowercase word, then -${tag}.clerk.test`) ??
          (mode === 'automatic_suggestion' && verified === true ? null : 'a domain is added verified, with automatic suggestions')
        );
      },
      forwards: asSent,
    },
    listPermissions: {
      refuses: ({ query }) => onlyKeys(query, ['query', 'limit']) ?? (query.get('query') === SYSTEM_PERMISSIONS.query ? null : `permissions are listed with query ${SYSTEM_PERMISSIONS.query} only`),
      forwards: () => ({ params: {}, query: new URLSearchParams(SYSTEM_PERMISSIONS), body: {} }),
      answered: (_asked, reply) => listed(reply, idAndKey),
    },
    listRoles: {
      refuses: ({ query }) => onlyKeys(query, ['query']) ?? (CUSTOM_ROLES.includes(query.get('query') ?? '') ? null : `roles are looked up by one custom role of the tests: ${CUSTOM_ROLES.join(', ')}`),
      forwards: ({ query }) => ({ params: {}, query: new URLSearchParams({ query: query.get('query')! }), body: {} }),
      answered: (_asked, reply) => listed(reply, (role) => ({ ...idAndKey(role), permissions: listOf({ data: role.permissions }).map((permission) => ({ key: permission.key })) })),
    },
    createRole: {
      async refuses({ body }) {
        const { name, key, permissions } = body;
        const role = isHarnessRole(key) ? HARNESS_ROLES[key] : null;
        if (role === null) return `${String(key)} is not a custom role of the tests; they create ${CUSTOM_ROLES.join(', ')}`;
        const extra = onlyKeys(body, ['name', 'key', 'permissions']);
        if (extra !== null) return extra;
        if (name !== role.name) return `role ${key} is named ${role.name}`;
        if (!Array.isArray(permissions) || permissions.some((id) => typeof id !== 'string')) return 'permissions is not a list of permission ids';
        const keys = await systemPermissionKeys();
        const given = (permissions as string[]).map((id) => keys.get(id) ?? `${id} (not a permission id)`).sort();
        const wanted = [...role.permissions].sort();
        return given.join() === wanted.join() ? null : `role ${key} has exactly the permissions ${wanted.join(', ')}, and the request gives ${given.join(', ')}`;
      },
      forwards: asSent,
    },
  };

  const guardFor = (method: string | undefined, path: string): { readonly guard: Guard; readonly params: Readonly<Record<string, string>> } | undefined => {
    for (const call of Object.keys(BACKEND_CALLS) as BackendCall[]) {
      if (BACKEND_CALLS[call].method !== method) continue;
      const params = paramsOf(BACKEND_CALLS[call].path, path);
      if (params !== null) return { guard: guards[call], params };
    }
    return undefined;
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

  async function readyToLaunch(): Promise<Answer> {
    try {
      await deps.beforeLaunch();
      return { status: 200, body: '{}' };
    } catch (error) {
      return error instanceof VerifyFailure ? failure(503, 'verify_not_ready_to_launch', error) : clerkError(503, 'verify_not_ready_to_launch', (error as Error).message ?? String(error));
    }
  }

  async function answer(request: IncomingMessage): Promise<Answer> {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (request.method === ABOUT_TO_LAUNCH.method && url.pathname === `${STAND_IN_PATH}${ABOUT_TO_LAUNCH.path}`) return readyToLaunch();
    const found = guardFor(request.method, url.pathname);
    if (found === undefined) return clerkError(404, 'verify_stand_in_unknown_call', `the verify CLI's stand-in for the Backend API has no ${request.method} ${url.pathname}; the tests make ${Object.values(BACKEND_CALLS).map((call) => `${call.method} ${call.path}`).join(', ')}`);
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
    const { guard, params } = found;
    const asked: Asked = { params, query: url.searchParams, body };
    const why = await guard.refuses(asked);
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
