import type { ClerkClient } from '@clerk/backend';
import { describe, expect, it, vi } from 'vitest';

import { cliAuth } from '../server/cli-auth';
import { handle } from '../server/handle';

function bearer(token: string) {
  return new Request('http://test.local/cli', { headers: { Authorization: `Bearer ${token}` } });
}

/**
 * Build a fake `ClerkClient` whose `authenticateRequest` returns a stub `RequestState` —
 * matching the discriminated shape `verify-token.ts` consumes. We only need to model the
 * surface the cli-auth verifier touches: `isAuthenticated`, `toAuth()`, `reason`.
 */
function fakeClerkClient(
  authResult:
    | { isAuthenticated: true; auth: { subject: string; scopes: string[]; tokenType: string; claims?: unknown } }
    | { isAuthenticated: false; reason?: string },
): ClerkClient {
  return {
    authenticateRequest: vi.fn(async () => {
      await Promise.resolve();
      if (authResult.isAuthenticated) {
        return {
          isAuthenticated: true,
          toAuth: () => authResult.auth,
        };
      }
      return {
        isAuthenticated: false,
        reason: authResult.reason ?? 'rejected',
      };
    }),
  } as unknown as ClerkClient;
}

const FAKE_OAUTH_TOKEN = 'oat_fake_test_token_value_here';
const FAKE_SUBJECT = 'user_2abcDEFghiJKLmnoPQRstuVWXyz';

describe('cli-auth server: oauth_token path (mocked)', () => {
  it('verifyToken returns TokenInfo with type=oauth_token', async () => {
    const client = fakeClerkClient({
      isAuthenticated: true,
      auth: { subject: FAKE_SUBJECT, scopes: ['profile', 'email'], tokenType: 'oauth_token' },
    });
    const auth = cliAuth({ client });

    const info = await auth.verifyToken(FAKE_OAUTH_TOKEN);
    expect(info.type).toBe('oauth_token');
    expect(info.subject).toBe(FAKE_SUBJECT);
    expect(info.scopes).toEqual(['profile', 'email']);
  });

  it('handle() returns 200 + Identity body for a verified OAuth token', async () => {
    const client = fakeClerkClient({
      isAuthenticated: true,
      auth: { subject: FAKE_SUBJECT, scopes: ['profile'], tokenType: 'oauth_token' },
    });
    const auth = cliAuth({ client });

    const route = handle({ auth, accepts: 'oauth_token' });
    const res = await route(bearer(FAKE_OAUTH_TOKEN));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sub: string };
    expect(body.sub).toBe(FAKE_SUBJECT);
  });

  it('surfaces clerk.authenticateRequest rejection as not_authenticated', async () => {
    const client = fakeClerkClient({ isAuthenticated: false, reason: 'OAuth token expired' });
    const auth = cliAuth({ client });

    await expect(auth.verifyToken(FAKE_OAUTH_TOKEN)).rejects.toThrow(/OAuth token expired/);
  });

  it('preserves api_key claims field when present', async () => {
    const client = fakeClerkClient({
      isAuthenticated: true,
      auth: { subject: 'user_abc', scopes: ['cli:read'], tokenType: 'api_key', claims: { tenant_id: 'org_xyz' } },
    });
    const auth = cliAuth({ client });

    const info = await auth.verifyToken('ak_fake_value');
    expect(info.type).toBe('api_key');
    expect(info.claims).toEqual({ tenant_id: 'org_xyz' });
  });
});
