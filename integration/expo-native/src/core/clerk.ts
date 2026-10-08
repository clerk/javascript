import { runEmailPrefix } from '../../specs/support/clerk.ts';
import type { InstanceKeys } from './keys.ts';
import { VerifyFailure, type PublishableKey, type RunId, type TestEmail } from './types.ts';

export function frontendApiHost(pk: PublishableKey): string {
  const decoded = Buffer.from(pk.replace(/^pk_(test|live)_/, ''), 'base64url').toString('utf8');
  return decoded.replace(/\$$/, '');
}

export interface RunUser {
  readonly userId: string;
  readonly email: TestEmail;
}

export interface ClerkBackend {
  usersOfRun(run: RunId): Promise<readonly RunUser[]>;
  userCount(): Promise<number>;
}

export const DEVELOPMENT_USER_LIMIT = 100;
export const REPLACE_AT_USERS = 60;
export const USERS_PAGE_LIMIT = 500;

export const BACKEND_API_HOST = 'api.clerk.com';

export const ownKeyRefused = (): VerifyFailure =>
  new VerifyFailure(
    'NOT_READY',
    `${BACKEND_API_HOST} answered 401 to the instance's own secret key; the likely cause is a cloud environment whose API credential for ${BACKEND_API_HOST} has no path prefix, so it replaces the key on every request to that host`,
    `set Path prefixes on that credential to /v1/platform/, so it is attached to Platform API calls only, then rerun`,
  );

export const userLimitReached = (): VerifyFailure =>
  new VerifyFailure('INSTANCE_MISCONFIGURED', `the instance holds the ${DEVELOPMENT_USER_LIMIT} users a development instance allows, and Clerk refused one more`, `the next \`{cli} run\` replaces the instance once it holds ${REPLACE_AT_USERS} users; rerun`);

class ClerkHttpError extends Error {
  constructor(status: number, codes: readonly string[], path: string) {
    super(`Clerk ${path} answered ${status}${codes.length ? ` (${codes.join(', ')})` : ''}`);
  }
}

export function createClerkBackends(fetchImpl: typeof fetch = fetch): (keys: () => InstanceKeys) => ClerkBackend {
  async function request(keys: InstanceKeys, method: string, path: string): Promise<unknown> {
    const response = await keys.sk.use('bapi-authorization', (plain) =>
      fetchImpl(`https://${BACKEND_API_HOST}/v1${path}`, {
        method,
        headers: { Authorization: `Bearer ${plain}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30_000),
      }),
    );
    const text = await response.text();
    if (response.status === 401) throw ownKeyRefused();
    let json: unknown = null;
    try {
      json = text.length > 0 ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    if (response.status < 200 || response.status >= 300) {
      const errors = (json as { errors?: { code?: string }[] } | null)?.errors ?? [];
      throw new ClerkHttpError(response.status, errors.map((e) => e.code ?? 'unknown'), `${method} ${path.split('?')[0]}`);
    }
    return json;
  }

  return (keys) => ({
    async usersOfRun(run) {
      const prefix = runEmailPrefix(run);
      const listed = await request(keys(), 'GET', `/users?limit=${USERS_PAGE_LIMIT}&email_address_query=${encodeURIComponent(prefix)}`);
      if (!Array.isArray(listed)) return [];
      return listed.flatMap((user: { id?: unknown; email_addresses?: { email_address?: unknown }[] } | null) => {
        const email = (user?.email_addresses ?? []).map((address) => address.email_address).find((address): address is string => typeof address === 'string' && address.startsWith(prefix));
        return typeof user?.id === 'string' && email !== undefined ? [{ userId: user.id, email: email as TestEmail }] : [];
      });
    },
    async userCount() {
      const counted = (await request(keys(), 'GET', '/users/count')) as { total_count?: unknown } | null;
      if (typeof counted?.total_count !== 'number') throw new Error('Clerk counted the users of the instance without a total');
      return counted.total_count;
    },
  });
}
