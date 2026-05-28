import { type APIKey, type ClerkClient, createClerkClient, type M2MToken, type User } from '@clerk/backend';

import { cliAuth, type CliAuthInstance } from '../../server';

export const INTEGRATION_SECRET_KEY = process.env.CLERK_SECRET_KEY;

/** Skip the suite when the secret isn't configured — CI without it is a no-op. */
export const skipWhenNoSecret = !INTEGRATION_SECRET_KEY;

export interface IntegrationFixtures {
  clerk: ClerkClient;
  auth: CliAuthInstance;
  user: User;
  apiKey: APIKey;
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

  // Unique-per-run email so reruns in parallel CI shards don't collide.
  const email = `cli-auth-int+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const user = await clerk.users.createUser({ emailAddress: [email] });

  const apiKey = await clerk.apiKeys.create({
    name: `cli-auth integration ${Date.now()}`,
    subject: user.id,
    scopes: ['cli:read'],
  });

  const m2mTokenOpaque = await clerk.m2m.createToken({ tokenFormat: 'opaque' });
  const m2mTokenJwt = await clerk.m2m.createToken({ tokenFormat: 'jwt' });

  return { clerk, auth, user, apiKey, m2mTokenOpaque, m2mTokenJwt };
}

/** Tear down everything `provisionFixtures` created. Each step is best-effort. */
export async function teardownFixtures(fixtures: IntegrationFixtures | undefined): Promise<void> {
  if (!fixtures) {
    return;
  }
  const { clerk, user, apiKey, m2mTokenOpaque, m2mTokenJwt } = fixtures;

  await Promise.allSettled([
    clerk.apiKeys.delete(apiKey.id),
    clerk.m2m.revokeToken({ m2mTokenId: m2mTokenOpaque.id }),
    clerk.m2m.revokeToken({ m2mTokenId: m2mTokenJwt.id }),
  ]);
  // Delete the user last so any token references resolve cleanly during revoke.
  await Promise.allSettled([clerk.users.deleteUser(user.id)]);
}

/** Build a Web `Request` with `Authorization: Bearer <token>` for handle() tests. */
export function bearerRequest(token: string, url = 'http://test.local/cli'): Request {
  return new Request(url, { headers: { Authorization: `Bearer ${token}` } });
}
