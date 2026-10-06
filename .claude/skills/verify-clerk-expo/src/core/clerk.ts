import { Secret } from './secret.ts';
import type { InstanceKeys } from './keys.ts';
import {
  VerifyFailure,
  type PublishableKey,
  type RunId,
  type SeededUser,
  type TestEmail,
  type TestPhone,
} from './types.ts';

export function frontendApiHost(pk: PublishableKey): string {
  const decoded = Buffer.from(pk.replace(/^pk_(test|live)_/, ''), 'base64url').toString('utf8');
  return decoded.replace(/\$$/, '');
}

function notTestIdentity(value: string, kind: string): VerifyFailure {
  return new VerifyFailure('NOT_TEST_IDENTITY', `${value} is not a ${kind}`, 'use an address with +clerk_test or a 555-0100..0199 phone that this run created');
}

export function newTestEmail(run: RunId, n: number): TestEmail {
  const runPart = run.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return parseTestEmail(`verify_${runPart}_${n}+clerk_test@example.com`);
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

export interface ClerkBackend {
  createUser(email: TestEmail, phone: TestPhone | null): Promise<SeededUser>;
  mintTicket(user: SeededUser, expiresInSeconds: number): Promise<Secret<'ticket'>>;
  findUserId(email: TestEmail): Promise<string | null>;
  userCount(): Promise<number>;
  apiHost(): Promise<BackendApiHost>;
}

export const DEVELOPMENT_USER_LIMIT = 100;
export const REPLACE_AT_USERS = 60;

export const BACKEND_API_HOSTS = ['api.clerk.com', 'api.clerk.dev'] as const;
export type BackendApiHost = (typeof BACKEND_API_HOSTS)[number];

export const BACKEND_API_FIX =
  'in a cloud environment, set Path prefixes on the API credential for api.clerk.com to /v1/platform/ so it is attached to Platform API calls only, and add api.clerk.dev to the allowed domains';

class ClerkHttpError extends Error {
  readonly status: number;
  readonly codes: readonly string[];
  constructor(status: number, codes: readonly string[], path: string) {
    super(`Clerk ${path} answered ${status}${codes.length ? ` (${codes.join(', ')})` : ''}`);
    this.status = status;
    this.codes = codes;
  }
}

export function createClerkBackends(fetchImpl: typeof fetch = fetch, onFallback: (line: string) => void = () => undefined): (keys: () => InstanceKeys) => ClerkBackend {
  let host: BackendApiHost = BACKEND_API_HOSTS[0];

  async function request(keys: InstanceKeys, method: string, path: string, body?: unknown): Promise<unknown> {
    const { sk } = keys;
    const send = async (to: BackendApiHost): Promise<{ readonly status: number; readonly text: string }> => {
      const response = await sk.use('bapi-authorization', (plain) =>
        fetchImpl(`https://${to}/v1${path}`, {
          method,
          headers: { Authorization: `Bearer ${plain}`, 'Content-Type': 'application/json' },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        }),
      );
      return { status: response.status, text: await response.text() };
    };
    let answer = await send(host);
    if (answer.status === 401 && host === BACKEND_API_HOSTS[0]) {
      const other = await send(BACKEND_API_HOSTS[1]).catch(() => null);
      if (other !== null && other.status >= 200 && other.status < 300) {
        host = BACKEND_API_HOSTS[1];
        onFallback(`clerk   ${BACKEND_API_HOSTS[0]} answered 401 to the instance's own secret key and ${host} accepted it, so something replaces the Authorization header on ${BACKEND_API_HOSTS[0]}; using ${host} for the Backend API`);
        answer = other;
      }
    }
    let json: unknown = null;
    try {
      json = answer.text.length > 0 ? JSON.parse(answer.text) : null;
    } catch {
      json = null;
    }
    if (answer.status < 200 || answer.status >= 300) {
      const errors = (json as { errors?: { code?: string }[] } | null)?.errors ?? [];
      throw new ClerkHttpError(answer.status, errors.map((e) => e.code ?? 'unknown'), `${method} ${path.split('?')[0]}`);
    }
    return json;
  }

  return (keys) => {
    const bapi = (method: string, path: string, body?: unknown): Promise<unknown> => request(keys(), method, path, body);

    async function usersByEmail(email: TestEmail): Promise<readonly { id: string }[]> {
      const users = await bapi('GET', `/users?email_address=${encodeURIComponent(email)}`);
      return Array.isArray(users) ? users.filter((u): u is { id: string } => typeof u?.id === 'string') : [];
    }

    return {
      async createUser(email, phone) {
        const created = (await bapi('POST', '/users', {
          email_address: [email],
          ...(phone === null ? {} : { phone_number: [phone] }),
          skip_password_requirement: true,
        }).catch((error: unknown) => {
          if (!(error instanceof ClerkHttpError && error.status === 403 && error.codes.includes('user_quota_exceeded'))) throw error;
          throw new VerifyFailure('INSTANCE_MISCONFIGURED', `the instance holds the ${DEVELOPMENT_USER_LIMIT} users a development instance allows, and Clerk refused one more`, `the next \`{cli} run\` replaces the instance once it holds ${REPLACE_AT_USERS} users; rerun`);
        })) as { id?: unknown };
        if (typeof created.id !== 'string') throw new Error('Clerk created a user without an id');
        return { id: created.id, email, phone };
      },
      async mintTicket(user, expiresInSeconds) {
        const token = (await bapi('POST', '/sign_in_tokens', { user_id: user.id, expires_in_seconds: expiresInSeconds })) as { token?: unknown };
        if (typeof token.token !== 'string') throw new Error('Clerk returned a sign-in token without a token');
        return new Secret('ticket', token.token);
      },
      async findUserId(email) {
        return (await usersByEmail(email))[0]?.id ?? null;
      },
      async userCount() {
        const counted = (await bapi('GET', '/users/count')) as { total_count?: unknown } | null;
        if (typeof counted?.total_count !== 'number') throw new Error('Clerk counted the users of the instance without a total');
        return counted.total_count;
      },
      async apiHost() {
        await bapi('GET', '/users?limit=1');
        return host;
      },
    };
  };
}

export const isUnauthorized = (error: unknown): boolean => error instanceof ClerkHttpError && error.status === 401;

export function isConflict(error: unknown): boolean {
  return error instanceof ClerkHttpError && error.status === 422;
}
