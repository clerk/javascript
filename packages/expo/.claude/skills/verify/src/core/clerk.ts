import { Secret } from './secret.ts';
import type { InstanceKeys } from './keys.ts';
import {
  VerifyFailure,
  type DeletionTarget,
  type InstanceName,
  type PublishableKey,
  type RunId,
  type SeededUser,
  type TestEmail,
  type TestPhone,
} from './types.ts';

export interface InstanceSettings {
  readonly strategies: readonly string[];
  readonly organizations: boolean;
}

export const INSTANCE_REQUIREMENTS: Readonly<Record<InstanceName, InstanceSettings>> = {
  'with-email-codes': { strategies: ['email_code', 'ticket'], organizations: true },
  'with-session-tasks': { strategies: ['email_code', 'ticket'], organizations: true },
  'with-session-tasks-setup-mfa': { strategies: ['email_code', 'ticket'], organizations: false },
};

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
  createUser(instance: InstanceName, email: TestEmail, phone: TestPhone | null): Promise<SeededUser>;
  mintTicket(user: SeededUser, expiresInSeconds: number): Promise<Secret<'ticket'>>;
  deleteByEmail(instance: InstanceName, email: TestEmail): Promise<{ readonly users: number; readonly organizations: number }>;
  previewDeleteByEmail(instance: InstanceName, email: TestEmail): Promise<readonly DeletionTarget[]>;
  findUserId(instance: InstanceName, email: TestEmail): Promise<string | null>;
  settings(instance: InstanceName): Promise<InstanceSettings>;
}

const BAPI = 'https://api.clerk.com/v1';

class ClerkHttpError extends Error {
  readonly status: number;
  readonly codes: readonly string[];
  constructor(status: number, codes: readonly string[], path: string) {
    super(`Clerk ${path} answered ${status}${codes.length ? ` (${codes.join(', ')})` : ''}`);
    this.status = status;
    this.codes = codes;
  }
}

export function createClerkBackend(keysFor: (instance: InstanceName) => InstanceKeys, fetchImpl: typeof fetch = fetch): ClerkBackend {
  async function bapi(instance: InstanceName, method: string, path: string, body?: unknown): Promise<unknown> {
    const { sk } = keysFor(instance);
    const response = await sk.use('bapi-authorization', (plain) =>
      fetchImpl(`${BAPI}${path}`, {
        method,
        headers: { Authorization: `Bearer ${plain}`, 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    );
    const text = await response.text();
    const json: unknown = text.length > 0 ? JSON.parse(text) : null;
    if (!response.ok) {
      const errors = (json as { errors?: { code?: string }[] } | null)?.errors ?? [];
      throw new ClerkHttpError(response.status, errors.map((e) => e.code ?? 'unknown'), `${method} ${path.split('?')[0]}`);
    }
    return json;
  }

  async function ownedOrganizations(instance: InstanceName, userId: string): Promise<readonly { readonly id: string; readonly name: string }[]> {
    const memberships = (await bapi(instance, 'GET', `/users/${userId}/organization_memberships?limit=100`).catch((error: unknown) => {
      if (error instanceof ClerkHttpError && error.codes.includes('organization_not_enabled_in_instance')) return { data: [] };
      throw error;
    })) as { data?: { organization?: { id?: string; name?: string; created_by?: string } }[] };
    return (memberships.data ?? []).flatMap(({ organization: org }) =>
      typeof org?.id === 'string' && org.created_by === userId ? [{ id: org.id, name: org.name ?? '' }] : [],
    );
  }

  async function usersByEmail(instance: InstanceName, email: TestEmail): Promise<readonly { id: string }[]> {
    const users = await bapi(instance, 'GET', `/users?email_address=${encodeURIComponent(email)}`);
    return Array.isArray(users) ? users.filter((u): u is { id: string } => typeof u?.id === 'string') : [];
  }

  return {
    async createUser(instance, email, phone) {
      const created = (await bapi(instance, 'POST', '/users', {
        email_address: [email],
        ...(phone === null ? {} : { phone_number: [phone] }),
        skip_password_requirement: true,
      })) as { id?: unknown };
      if (typeof created.id !== 'string') throw new Error('Clerk created a user without an id');
      return { id: created.id, instance, email, phone };
    },
    async mintTicket(user, expiresInSeconds) {
      const token = (await bapi(user.instance, 'POST', '/sign_in_tokens', { user_id: user.id, expires_in_seconds: expiresInSeconds })) as { token?: unknown };
      if (typeof token.token !== 'string') throw new Error('Clerk returned a sign-in token without a token');
      return new Secret('ticket', token.token);
    },
    async findUserId(instance, email) {
      return (await usersByEmail(instance, email))[0]?.id ?? null;
    },
    async previewDeleteByEmail(instance, email) {
      const targets: DeletionTarget[] = [];
      for (const user of await usersByEmail(instance, email)) {
        targets.push({ kind: 'user', instance, id: user.id, email });
        for (const org of await ownedOrganizations(instance, user.id)) targets.push({ kind: 'organization', instance, ...org });
      }
      return targets;
    },
    async deleteByEmail(instance, email) {
      let users = 0;
      let organizations = 0;
      for (const user of await usersByEmail(instance, email)) {
        for (const org of await ownedOrganizations(instance, user.id)) {
          try {
            await bapi(instance, 'DELETE', `/organizations/${org.id}`);
            organizations += 1;
          } catch (error) {
            if (!(error instanceof ClerkHttpError && error.status === 404)) throw error;
          }
        }
        try {
          await bapi(instance, 'DELETE', `/users/${user.id}`);
          users += 1;
        } catch (error) {
          if (!(error instanceof ClerkHttpError && error.status === 404)) throw error;
        }
      }
      return { users, organizations };
    },
    async settings(instance) {
      const host = frontendApiHost(keysFor(instance).pk);
      const response = await fetchImpl(`https://${host}/v1/environment`);
      if (!response.ok) throw new Error(`FAPI environment answered ${response.status}`);
      const env = (await response.json()) as {
        user_settings?: { attributes?: Record<string, { enabled?: boolean; first_factors?: string[]; second_factors?: string[]; verifications?: string[] }> };
        organization_settings?: { enabled?: boolean };
      };
      const found = new Set<string>();
      for (const [name, attribute] of Object.entries(env.user_settings?.attributes ?? {})) {
        if (!attribute.enabled) continue;
        if (name === 'ticket') found.add('ticket');
        for (const s of [...(attribute.first_factors ?? []), ...(attribute.second_factors ?? []), ...(attribute.verifications ?? [])]) found.add(s);
      }
      return { strategies: [...found].sort(), organizations: env.organization_settings?.enabled === true };
    },
  };
}

export function isConflict(error: unknown): boolean {
  return error instanceof ClerkHttpError && error.status === 422;
}
