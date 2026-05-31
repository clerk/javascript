import {
  type APIKey,
  type ClerkClient,
  createClerkClient,
  type Machine,
  type Organization,
  type User,
} from '@clerk/backend';

import { cliAuth, type CliAuthInstance } from '../../server';

export const INTEGRATION_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const INTEGRATION_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY;

/** Skip the suite when keys aren't configured — CI without them is a no-op. */
export const skipWhenNoSecret = !INTEGRATION_SECRET_KEY || !INTEGRATION_PUBLISHABLE_KEY;

/**
 * Module-scope Clerk client + cliAuth instance. `createClerkClient` doesn't validate
 * keys at construction (only when methods are called), so this is safe to build even
 * when the suite is skipped — the factory helpers below just never get called.
 *
 * `clerk.authenticateRequest` requires *both* keys (publishable for JWKs and audience
 * resolution, secret for BAPI calls), which is why we set them here rather than relying
 * on the env at call-time.
 */
const clerk: ClerkClient = createClerkClient({
  secretKey: INTEGRATION_SECRET_KEY ?? '',
  publishableKey: INTEGRATION_PUBLISHABLE_KEY ?? '',
});
const auth: CliAuthInstance = cliAuth({ client: clerk });

export interface IntegrationFixtures {
  clerk: ClerkClient;
  auth: CliAuthInstance;
  /** Identities used as API key subjects. */
  user: User;
  org: Organization;
  machine: Machine;
  /** API keys, one per supported subject kind. */
  userApiKey: APIKey;
  orgApiKey: APIKey;
  machineApiKey: APIKey;
}

// ---------------------------------------------------------------------------
// Factory helpers — small, named primitives. Each call generates its own
// unique slug so reruns in parallel CI shards don't collide on names. Inputs
// other than slug are explicit.
// ---------------------------------------------------------------------------

function uniqueSlug(): string {
  return `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

async function createTestUser(): Promise<User> {
  const slug = uniqueSlug();
  try {
    return await clerk.users.createUser({
      username: `cliauthint${slug}`,
      password: `Test_${slug}_${Date.now()}`,
      skipPasswordChecks: true,
    });
  } catch (err) {
    // Surface BAPI validation errors so failures are actionable, not opaque.
    const detail = (err as { errors?: unknown }).errors;
    throw new Error(
      `clerk.users.createUser failed: ${(err as Error).message}${detail ? `\n${JSON.stringify(detail, null, 2)}` : ''}`,
    );
  }
}

async function createTestOrg(createdBy: string): Promise<Organization> {
  return clerk.organizations.createOrganization({
    name: `cli-auth integration ${uniqueSlug()}`,
    createdBy,
  });
}

async function createTestMachine(): Promise<Machine> {
  return clerk.machines.create({ name: `cli-auth integration ${uniqueSlug()}` });
}

async function createTestApiKey(opts: { subject: string; scopes?: string[] }): Promise<APIKey> {
  return clerk.apiKeys.create({
    name: `cli-auth integration ${uniqueSlug()}`,
    subject: opts.subject,
    scopes: opts.scopes ?? [],
  });
}

// ---------------------------------------------------------------------------

/**
 * Provision the throwaway Clerk resources we verify against: a user, an org owned by that
 * user, and a machine — plus one API key per subject kind (user/org/machine). Shared
 * across the suite via `beforeAll` and torn down in `afterAll`.
 */
export async function provisionFixtures(): Promise<IntegrationFixtures> {
  if (!INTEGRATION_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is required for integration tests');
  }

  // Wave 1: user and machine are independent; provision in parallel.
  const [user, machine] = await Promise.all([createTestUser(), createTestMachine()]);

  // Wave 2: org needs an owner (createdBy = user.id).
  const org = await createTestOrg(user.id);

  // Wave 3: one API key per subject kind, all independent.
  const [userApiKey, orgApiKey, machineApiKey] = await Promise.all([
    createTestApiKey({ subject: user.id, scopes: ['cli:read'] }),
    createTestApiKey({ subject: org.id, scopes: ['cli:read'] }),
    createTestApiKey({ subject: machine.id, scopes: ['cli:read'] }),
  ]);

  return { clerk, auth, user, org, machine, userApiKey, orgApiKey, machineApiKey };
}

/** Tear down everything `provisionFixtures` created. Surfaces any cleanup failures. */
export async function teardownFixtures(fixtures: IntegrationFixtures | undefined): Promise<void> {
  if (!fixtures) {
    return;
  }
  const { user, org, machine, userApiKey, orgApiKey, machineApiKey } = fixtures;

  const results = await Promise.allSettled([
    clerk.apiKeys.delete(userApiKey.id),
    clerk.apiKeys.delete(orgApiKey.id),
    clerk.apiKeys.delete(machineApiKey.id),
    clerk.organizations.deleteOrganization(org.id),
    clerk.machines.delete(machine.id),
    clerk.users.deleteUser(user.id),
  ]);

  const labels = [
    'userApiKey delete',
    'orgApiKey delete',
    'machineApiKey delete',
    'org delete',
    'machine delete',
    'user delete',
  ];
  const failures = results.map((r, i) => ({ r, label: labels[i] })).filter(({ r }) => r.status === 'rejected');
  if (failures.length) {
    for (const { r, label } of failures) {
      const reason = (r as PromiseRejectedResult).reason;
      console.error(`[cli-auth integration] ${label} failed:`, reason);
    }
    throw new Error(`Integration teardown failed: ${failures.map(f => f.label).join(', ')}`);
  }
}

/** Build a Web `Request` with `Authorization: Bearer <token>` for handle() tests. */
export function bearerRequest(token: string, url = 'http://test.local/cli'): Request {
  return new Request(url, { headers: { Authorization: `Bearer ${token}` } });
}
