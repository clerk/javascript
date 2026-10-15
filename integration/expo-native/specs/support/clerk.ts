import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import { runIdParts, type ClerkAccess, type ClerkInstance } from './inputs.ts';
import { PASSWORD_WORDS, runNames, type RunNames } from './names.ts';
import { SHORTEST_SECRET, Secret, protect } from './secret.ts';
import { commandsFor } from './typing.ts';
import type { EmailOptions, OrganizationSeed, RunId, SecretLike, SeedOptions, SeededOrganization, SeededUser, TestEmail, TestPhone } from './types.ts';

export const BACKEND_API_URL = 'https://api.clerk.com/v1';

export const BACKEND_CALLS = {
  createUser: { method: 'POST', path: '/users' },
  signInToken: { method: 'POST', path: '/sign_in_tokens' },
  usersByPhone: { method: 'GET', path: '/users' },
  createOrganization: { method: 'POST', path: '/organizations' },
  createMembership: { method: 'POST', path: '/organizations/{organization_id}/memberships' },
  createDomain: { method: 'POST', path: '/organizations/{organization_id}/domains' },
  listPermissions: { method: 'GET', path: '/organization_permissions' },
  listRoles: { method: 'GET', path: '/organization_roles' },
  createRole: { method: 'POST', path: '/organization_roles' },
} as const;

export type BackendCall = keyof typeof BACKEND_CALLS;

export const PATH_PARAM = /\{([a-z_]+)\}/g;

export const backendPath = (call: BackendCall, params: Readonly<Record<string, string>> = {}): string =>
  BACKEND_CALLS[call].path.replace(PATH_PARAM, (_, name: string) => encodeURIComponent(params[name] ?? ''));

export const HARNESS_ROLES = {
  'org:admin': null,
  'org:member': null,
  'org:e2e_domains_reader': { name: 'Domains reader', permissions: ['org:sys_domains:read', 'org:sys_memberships:read'] },
} as const satisfies Readonly<Record<string, { readonly name: string; readonly permissions: readonly string[] } | null>>;

export type HarnessRole = keyof typeof HARNESS_ROLES;

export const isHarnessRole = (value: unknown): value is HarnessRole => typeof value === 'string' && Object.hasOwn(HARNESS_ROLES, value);

export const SYSTEM_PERMISSIONS = { query: 'org:sys_', limit: '100' } as const;

export const ABOUT_TO_LAUNCH = { method: 'POST', path: '/about_to_launch' } as const;

export const TICKET_SECONDS = 120;

// Node gives each address of a host 250 ms to connect before it tries the next, and fails the request when
// all of them miss it. On a network with no IPv6 route that fails about one request in five to api.clerk.com.
export const CONNECT_ATTEMPT_MS = 2_500;
net.setDefaultAutoSelectFamilyAttemptTimeout(CONNECT_ATTEMPT_MS);

const notTestIdentity = (value: string, kind: string): Error => new Error(`${value} is not a ${kind}; use an address with +clerk_test or a 555-0100..0199 phone that this run created`);

const tagOf = (run: RunId): string => runIdParts(run).tag;

export const testEmail = (run: RunId, person: string, domain = 'example.com'): TestEmail => parseTestEmail(`${person}.${tagOf(run)}+clerk_test@${domain}`);

export const isTestEmailOf = (run: RunId, email: string): boolean => new RegExp(`^[a-z]+[0-9]*\\.${tagOf(run)}\\+clerk_test@[a-z0-9.-]+\\.[a-z]+$`).test(email);

export const organizationName = (run: RunId, word: string): string => `${word} ${tagOf(run)}`;

export const isOrganizationNameOf = (run: RunId, name: string): boolean => new RegExp(`^[A-Z][a-z]+[0-9]* ${tagOf(run)}$`).test(name);

export const testDomain = (run: RunId, word: string): string => `${word.toLowerCase()}-${tagOf(run)}.clerk.test`;

export const isTestDomainOf = (run: RunId, domain: string): boolean => new RegExp(`^[a-z]+[0-9]*-${tagOf(run)}\\.clerk\\.test$`).test(domain);

const TEST_EMAIL = /^[a-z0-9._-]+\+clerk_test@[a-z0-9.-]+\.[a-z]+$/;
export function parseTestEmail(value: string): TestEmail {
  if (!TEST_EMAIL.test(value)) throw notTestIdentity(value, '+clerk_test email');
  return value as TestEmail;
}

export function parseTestPhone(value: string): TestPhone {
  const digits = value.replace(/[^0-9]/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (!/^[2-9]\d{2}55501\d{2}$/.test(national)) throw notTestIdentity(value, '555-0100..0199 test phone');
  return `+1${national}` as TestPhone;
}

export const TEST_PHONES: readonly TestPhone[] = Array.from({ length: 100 }, (_, n) => parseTestPhone(`+1201555${String(100 + n).padStart(4, '0')}`));

export function typedPassword(value: string): Secret<'password'> {
  const password = new Secret('password', value);
  for (const typedAtOnce of commandsFor(value)) if (typedAtOnce.length >= SHORTEST_SECRET) protect(typedAtOnce);
  return password;
}

export function passwordFrom(bytes: Uint8Array): string {
  if (bytes.length < 4) throw new Error('a password is made from at least four bytes');
  const words = PASSWORD_WORDS.length;
  const first = bytes[0]! % words;
  const second = (first + 1 + (bytes[1]! % (words - 1))) % words;
  return `${PASSWORD_WORDS[first]}-${PASSWORD_WORDS[second]}-${Buffer.from(bytes.subarray(2, 4)).toString('hex')}`;
}

export const newTestPassword = (): Secret<'password'> => typedPassword(passwordFrom(randomBytes(4)));

export const runPassword = (run: RunId): Secret<'password'> => typedPassword(passwordFrom(createHash('sha256').update(run).digest()));

export interface TestUsers {
  newEmail(options?: EmailOptions): TestEmail;
  newOrganizationName(): string;
  newPhone(): Promise<TestPhone>;
  seed(options?: SeedOptions): Promise<SeededUser>;
  seedOrganization<Seed extends OrganizationSeed>(seed: Seed): Promise<SeededOrganization<Seed>>;
  signInTicket(user: SeededUser): Promise<Secret<'ticket'>>;
}

interface Reply {
  readonly status: number;
  readonly json: unknown;
}

const ok = (reply: Reply): boolean => reply.status >= 200 && reply.status < 300;

const errorsOf = (reply: Reply): readonly { readonly code?: string; readonly message?: string; readonly long_message?: string }[] => (reply.json as { errors?: { code?: string; message?: string; long_message?: string }[] } | null)?.errors ?? [];

const identifierIsTaken = (reply: Reply): boolean => reply.status === 422 && errorsOf(reply).some((error) => error.code === 'form_identifier_exists');

interface Listed {
  readonly id: string;
  readonly key: string;
  readonly permissions?: readonly { readonly key: string }[];
}

const listedOf = (reply: Reply): readonly Listed[] => (reply.json as { data?: Listed[] } | null)?.data ?? [];

function refusal(call: BackendCall, reply: Reply): Error {
  const said = errorsOf(reply).map((error) => error.long_message ?? error.message ?? error.code ?? 'no reason given').join('; ');
  const { method, path } = BACKEND_CALLS[call];
  return new Error(`Clerk ${method} ${path} answered ${reply.status}${said === '' ? '' : `: ${said}`}`);
}

function endpoint(access: ClerkAccess): { readonly baseUrl: string; readonly bearer: SecretLike } {
  if (access.kind === 'secret-key') return { baseUrl: BACKEND_API_URL, bearer: access.key };
  return { baseUrl: access.url, bearer: new Secret('stand-in-token', readFileSync(access.tokenFile, 'utf8')) };
}

export async function aboutToLaunch(access: ClerkAccess, fetchImpl: typeof fetch = fetch): Promise<void> {
  if (access.kind !== 'stand-in') return;
  const { baseUrl, bearer } = endpoint(access);
  const response = await bearer.use('bapi-authorization', (plain) =>
    fetchImpl(`${baseUrl}${ABOUT_TO_LAUNCH.path}`, { method: ABOUT_TO_LAUNCH.method, headers: { Authorization: `Bearer ${plain}` }, signal: AbortSignal.timeout(60_000) }),
  );
  if (response.ok) return;
  const said = errorsOf({ status: response.status, json: await response.json().catch(() => null) }).map((error) => error.long_message ?? error.message ?? error.code);
  throw new Error(`the verify CLI was not ready for the app to launch: ${said.join('; ') || `it answered ${response.status}`}`);
}

export function testUsers(clerk: ClerkInstance, run: RunId, fetchImpl: typeof fetch = fetch, names: RunNames = runNames(run)): TestUsers {
  runPassword(run);
  const handedOut = new Set<TestPhone>();

  async function ask(call: BackendCall, sent: { readonly params?: Readonly<Record<string, string>>; readonly query?: string; readonly body?: unknown }): Promise<Reply> {
    const { method } = BACKEND_CALLS[call];
    const { baseUrl, bearer } = endpoint(clerk.access);
    const response = await bearer.use('bapi-authorization', (plain) =>
      fetchImpl(`${baseUrl}${backendPath(call, sent.params)}${sent.query === undefined ? '' : `?${sent.query}`}`, {
        method,
        headers: { Authorization: `Bearer ${plain}`, 'Content-Type': 'application/json' },
        ...(sent.body === undefined ? {} : { body: JSON.stringify(sent.body) }),
        signal: AbortSignal.timeout(30_000),
      }),
    );
    const text = await response.text();
    try {
      return { status: response.status, json: text.length > 0 ? JSON.parse(text) : null };
    } catch {
      return { status: response.status, json: null };
    }
  }

  function phonesNotHandedOut(): readonly TestPhone[] {
    const first = Math.floor(Math.random() * TEST_PHONES.length);
    return TEST_PHONES.map((_, i) => TEST_PHONES[(first + i) % TEST_PHONES.length]!).filter((phone) => !handedOut.has(phone));
  }

  async function answered(call: BackendCall, sent: Parameters<typeof ask>[1]): Promise<Reply> {
    const reply = await ask(call, sent);
    if (!ok(reply)) throw refusal(call, reply);
    return reply;
  }

  const roleOnInstance = async (role: HarnessRole): Promise<Listed | undefined> =>
    listedOf(await answered('listRoles', { query: `query=${encodeURIComponent(role)}` })).find((listed) => listed.key === role);

  function asTheTableSays(role: HarnessRole, listed: Listed): void {
    const wanted = [...(HARNESS_ROLES[role]?.permissions ?? [])].sort();
    const has = (listed.permissions ?? []).map((permission) => permission.key).sort();
    if (has.join() !== wanted.join()) throw new Error(`role ${role} on this instance has the permissions ${has.join(', ')}, and the tests give it ${wanted.join(', ')}; run down so the next run creates a new application`);
  }

  async function roleReady(role: HarnessRole): Promise<void> {
    const wanted = HARNESS_ROLES[role];
    if (wanted === null) return;
    const existing = await roleOnInstance(role);
    if (existing !== undefined) return asTheTableSays(role, existing);
    const permissions = listedOf(await answered('listPermissions', { query: new URLSearchParams(SYSTEM_PERMISSIONS).toString() }));
    const ids = wanted.permissions.map((key) => {
      const id = permissions.find((permission) => permission.key === key)?.id;
      if (id === undefined) throw new Error(`the instance has no permission ${key}, which role ${role} needs`);
      return id;
    });
    const made = await ask('createRole', { body: { name: wanted.name, key: role, permissions: ids } });
    if (ok(made)) return;
    if (!identifierIsTaken(made)) throw refusal('createRole', made);
    const raced = await roleOnInstance(role);
    if (raced === undefined) throw refusal('createRole', made);
    asTheTableSays(role, raced);
  }

  const everyPhoneTaken = (otherwise: string): Error => new Error(`every 555-0100..0199 test phone is taken on this instance; delete its test users${otherwise}`);

  return {
    newEmail: (options = {}) => testEmail(run, names.claim('person'), options.domain),
    newOrganizationName: () => organizationName(run, names.claim('organization')),
    async newPhone() {
      for (const phone of phonesNotHandedOut()) {
        const holders = await ask('usersByPhone', { query: `phone_number=${encodeURIComponent(phone)}` });
        if (!ok(holders)) throw refusal('usersByPhone', holders);
        if (Array.isArray(holders.json) && holders.json.length > 0) continue;
        handedOut.add(phone);
        return phone;
      }
      throw everyPhoneTaken('');
    },
    async seed(options = {}) {
      const email = testEmail(run, names.claim('person'));
      const password = options.password === true ? newTestPassword() : null;
      for (const phone of options.phone === true ? phonesNotHandedOut() : [null]) {
        const created = await ask('createUser', {
          body: {
            email_address: [email],
            ...(phone === null ? {} : { phone_number: [phone] }),
            ...(password === null ? { skip_password_requirement: true } : { password: password.use('bapi-user-password', (plain) => plain), bypass_client_trust: true }),
          },
        });
        if (phone !== null && identifierIsTaken(created)) continue;
        if (!ok(created)) throw refusal('createUser', created);
        const id = (created.json as { id?: unknown } | null)?.id;
        if (typeof id !== 'string') throw new Error('Clerk created a user without an id');
        if (phone !== null) handedOut.add(phone);
        return { id, email, phone, password };
      }
      throw everyPhoneTaken(', or seed without a phone');
    },
    async seedOrganization<Seed extends OrganizationSeed>(seed: Seed): Promise<SeededOrganization<Seed>> {
      const members = seed.members ?? [];
      for (const role of new Set(members.map((member) => member.role))) await roleReady(role);
      const word = names.claim('organization');
      const name = organizationName(run, word);
      const made = await answered('createOrganization', { body: { name, created_by: seed.creator.id } });
      const id = (made.json as { id?: unknown } | null)?.id;
      if (typeof id !== 'string') throw new Error('Clerk created an organization without an id');
      const params = { organization_id: id };
      for (const { user, role } of members) await answered('createMembership', { params, body: { user_id: user.id, role } });
      const domain = seed.suggestDomain === true ? testDomain(run, word) : null;
      if (domain !== null) await answered('createDomain', { params, body: { name: domain, enrollment_mode: 'automatic_suggestion', verified: true } });
      return { id, name, domain } as SeededOrganization<Seed>;
    },
    async signInTicket(user) {
      const minted = await ask('signInToken', { body: { user_id: user.id, expires_in_seconds: TICKET_SECONDS } });
      if (!ok(minted)) throw refusal('signInToken', minted);
      const token = (minted.json as { token?: unknown } | null)?.token;
      if (typeof token !== 'string') throw new Error('Clerk returned a sign-in token without a token');
      return new Secret('ticket', token);
    },
  };
}
