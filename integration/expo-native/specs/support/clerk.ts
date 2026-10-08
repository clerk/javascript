import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import type { ClerkAccess, ClerkInstance } from './inputs.ts';
import { SHORTEST_SECRET, Secret, protect } from './secret.ts';
import { commandsFor } from './typing.ts';
import type { RunId, SecretLike, SeedOptions, SeededUser, TestEmail, TestPhone } from './types.ts';

export const BACKEND_API_URL = 'https://api.clerk.com/v1';

export const BACKEND_CALLS = {
  createUser: { method: 'POST', path: '/users' },
  signInToken: { method: 'POST', path: '/sign_in_tokens' },
  usersByPhone: { method: 'GET', path: '/users' },
} as const;

export type BackendCall = keyof typeof BACKEND_CALLS;

export const TICKET_SECONDS = 120;

// Node gives each address of a host 250 ms to connect before it tries the next, and fails the request when
// all of them miss it. On a network with no IPv6 route that fails about one request in five to api.clerk.com.
export const CONNECT_ATTEMPT_MS = 2_500;
net.setDefaultAutoSelectFamilyAttemptTimeout(CONNECT_ATTEMPT_MS);

const notTestIdentity = (value: string, kind: string): Error => new Error(`${value} is not a ${kind}; use an address with +clerk_test or a 555-0100..0199 phone that this run created`);

export const runEmailPrefix = (run: RunId): string => `verify_${run.toLowerCase().replace(/[^a-z0-9]/g, '_')}_`;

export function newTestEmail(run: RunId): TestEmail {
  return parseTestEmail(`${runEmailPrefix(run)}${randomBytes(4).toString('hex')}+clerk_test@example.com`);
}

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

export function newTestPassword(): Secret<'password'> {
  return typedPassword(`${randomBytes(12).toString('hex')}Aa1!`);
}

export const runPassword = (run: RunId): Secret<'password'> => typedPassword(`Verify-${run}-Pw1!`);

export interface TestUsers {
  newEmail(): TestEmail;
  newPhone(): Promise<TestPhone>;
  seed(options?: SeedOptions): Promise<SeededUser>;
  signInTicket(user: SeededUser): Promise<Secret<'ticket'>>;
}

interface Reply {
  readonly status: number;
  readonly json: unknown;
}

const ok = (reply: Reply): boolean => reply.status >= 200 && reply.status < 300;

const errorsOf = (reply: Reply): readonly { readonly code?: string; readonly message?: string; readonly long_message?: string }[] => (reply.json as { errors?: { code?: string; message?: string; long_message?: string }[] } | null)?.errors ?? [];

const phoneIsTaken = (reply: Reply): boolean => reply.status === 422 && errorsOf(reply).some((error) => error.code === 'form_identifier_exists');

function refusal(call: BackendCall, reply: Reply): Error {
  const said = errorsOf(reply).map((error) => error.long_message ?? error.message ?? error.code ?? 'no reason given').join('; ');
  const { method, path } = BACKEND_CALLS[call];
  return new Error(`Clerk ${method} ${path} answered ${reply.status}${said === '' ? '' : `: ${said}`}`);
}

function endpoint(access: ClerkAccess): { readonly baseUrl: string; readonly bearer: SecretLike } {
  if (access.kind === 'secret-key') return { baseUrl: BACKEND_API_URL, bearer: access.key };
  return { baseUrl: access.url, bearer: new Secret('stand-in-token', readFileSync(access.tokenFile, 'utf8')) };
}

export function testUsers(clerk: ClerkInstance, run: RunId, fetchImpl: typeof fetch = fetch): TestUsers {
  runPassword(run);
  const handedOut = new Set<TestPhone>();

  async function ask(call: BackendCall, sent: { readonly query?: string; readonly body?: unknown }): Promise<Reply> {
    const { method, path } = BACKEND_CALLS[call];
    const { baseUrl, bearer } = endpoint(clerk.access);
    const response = await bearer.use('bapi-authorization', (plain) =>
      fetchImpl(`${baseUrl}${path}${sent.query === undefined ? '' : `?${sent.query}`}`, {
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

  const everyPhoneTaken = (otherwise: string): Error => new Error(`every 555-0100..0199 test phone is taken on this instance; delete its test users${otherwise}`);

  return {
    newEmail: () => newTestEmail(run),
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
      const email = newTestEmail(run);
      const password = options.password === true ? newTestPassword() : null;
      for (const phone of options.phone === true ? phonesNotHandedOut() : [null]) {
        const created = await ask('createUser', {
          body: {
            email_address: [email],
            ...(phone === null ? {} : { phone_number: [phone] }),
            ...(password === null ? { skip_password_requirement: true } : { password: password.use('bapi-user-password', (plain) => plain), bypass_client_trust: true }),
          },
        });
        if (phone !== null && phoneIsTaken(created)) continue;
        if (!ok(created)) throw refusal('createUser', created);
        const id = (created.json as { id?: unknown } | null)?.id;
        if (typeof id !== 'string') throw new Error('Clerk created a user without an id');
        if (phone !== null) handedOut.add(phone);
        return { id, email, phone, password };
      }
      throw everyPhoneTaken(', or seed without a phone');
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
