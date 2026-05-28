import {
  type APIKey,
  type ClerkClient,
  createClerkClient,
  type M2MToken,
  type Machine,
  type User,
} from '@clerk/backend';

import { cliAuth, type CliAuthInstance } from '../../server';

export const INTEGRATION_SECRET_KEY = process.env.CLERK_SECRET_KEY;

/** Skip the suite when the secret isn't configured — CI without it is a no-op. */
export const skipWhenNoSecret = !INTEGRATION_SECRET_KEY;

export interface IntegrationFixtures {
  clerk: ClerkClient;
  auth: CliAuthInstance;
  user: User;
  apiKey: APIKey;
  /** Throwaway machine created for this run. Deleted in `teardownFixtures`. */
  machine: Machine;
  m2mTokenOpaque: M2MToken;
  m2mTokenJwt: M2MToken;
}

/**
 * Create the throwaway Clerk resources we verify against: a user (subject for the API
 * key), one API key, and two M2M tokens (opaque and JWT-shaped). Returned fixtures are
 * shared across the suite via `beforeAll` and cleaned up in `afterAll`.
 */
export async function provisionFixtures(): Promise<IntegrationFixtures> {
  if (!INTEGRATION_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is required for integration tests');
  }

  const clerk = createClerkClient({ secretKey: INTEGRATION_SECRET_KEY });
  const auth = cliAuth({ client: clerk });

  // Unique-per-run identifier so reruns in parallel CI shards don't collide.
  const slug = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  let user;
  try {
    user = await clerk.users.createUser({
      username: `cliauthint${slug}`,
      password: `Test_${Math.random().toString(36).slice(2)}_${Date.now()}`,
      skipPasswordChecks: true,
    });
  } catch (err) {
    // Surface the BAPI validation errors so failures are actionable.
    const detail = (err as { errors?: unknown }).errors;
    throw new Error(
      `clerk.users.createUser failed: ${(err as Error).message}${detail ? `\n${JSON.stringify(detail, null, 2)}` : ''}`,
    );
  }

  const apiKey = await clerk.apiKeys.create({
    name: `cli-auth integration ${Date.now()}`,
    subject: user.id,
    scopes: ['cli:read'],
  });

  // Provision a throwaway machine + its secret so we can mint M2M tokens without
  // depending on any env var beyond CLERK_SECRET_KEY. Deleted in `teardownFixtures`.
  const machine = await clerk.machines.create({ name: `cli-auth integration ${slug}` });
  const { secret: machineSecretKey } = await clerk.machines.getSecretKey(machine.id);

  const m2mTokenOpaque = await clerk.m2m.createToken({ machineSecretKey, tokenFormat: 'opaque' });
  const m2mTokenJwt = await clerk.m2m.createToken({ machineSecretKey, tokenFormat: 'jwt' });

  return { clerk, auth, user, apiKey, machine, m2mTokenOpaque, m2mTokenJwt };
}

/** Tear down everything `provisionFixtures` created. Each step is best-effort. */
export async function teardownFixtures(fixtures: IntegrationFixtures | undefined): Promise<void> {
  if (!fixtures) {
    return;
  }
  const { clerk, user, apiKey, machine } = fixtures;

  // Deleting the machine cascades to its M2M tokens — no need to revoke them individually.
  await Promise.allSettled([clerk.apiKeys.delete(apiKey.id), clerk.machines.delete(machine.id)]);
  await Promise.allSettled([clerk.users.deleteUser(user.id)]);
}

/** Build a Web `Request` with `Authorization: Bearer <token>` for handle() tests. */
export function bearerRequest(token: string, url = 'http://test.local/cli'): Request {
  return new Request(url, { headers: { Authorization: `Bearer ${token}` } });
}
