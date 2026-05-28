import type * as ClerkBackendInternal from '@clerk/backend/internal';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/backend/internal', async importOriginal => {
  const actual = await importOriginal<typeof ClerkBackendInternal>();
  return {
    ...actual,
    verifyMachineAuthToken: vi.fn(),
  };
});

// Import order matters: pull the mocked function out *after* the mock is registered.
const { verifyMachineAuthToken } = await import('@clerk/backend/internal');
const { cliAuth } = await import('../server/cli-auth');
const { handle } = await import('../server/handle');

const mockedVerify = vi.mocked(verifyMachineAuthToken);

function bearer(token: string) {
  return new Request('http://test.local/cli', { headers: { Authorization: `Bearer ${token}` } });
}

const FAKE_OAUTH_TOKEN = 'oat_fake_test_token_value_here';

describe('cli-auth server: oauth_token path (mocked)', () => {
  it('verifyToken returns TokenInfo with type=oauth_token', async () => {
    mockedVerify.mockResolvedValueOnce({
      data: {
        subject: 'user_2abcDEFghiJKLmnoPQRstuVWXyz',
        scopes: ['profile', 'email'],
        claims: null,
      } as never,
      tokenType: 'oauth_token',
      errors: undefined,
    });

    const auth = cliAuth({ clientConfig: { secretKey: 'sk_test_xxx' } });
    const info = await auth.verifyToken(FAKE_OAUTH_TOKEN);
    expect(info.type).toBe('oauth_token');
    expect(info.subject).toBe('user_2abcDEFghiJKLmnoPQRstuVWXyz');
    expect(info.scopes).toEqual(['profile', 'email']);
  });

  it('handle() returns 200 + Identity body for a verified OAuth token', async () => {
    mockedVerify.mockResolvedValueOnce({
      data: {
        subject: 'user_2abcDEFghiJKLmnoPQRstuVWXyz',
        scopes: ['profile'],
        claims: null,
      } as never,
      tokenType: 'oauth_token',
      errors: undefined,
    });

    const auth = cliAuth({ clientConfig: { secretKey: 'sk_test_xxx' } });
    const route = handle({ auth, accepts: 'oauth_token' });
    const res = await route(bearer(FAKE_OAUTH_TOKEN));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sub: string };
    expect(body.sub).toBe('user_2abcDEFghiJKLmnoPQRstuVWXyz');
  });

  it('rejects when accepts gates out oauth_token', async () => {
    mockedVerify.mockResolvedValueOnce({
      data: {
        subject: 'user_xxx',
        scopes: undefined,
        claims: null,
      } as never,
      tokenType: 'oauth_token',
      errors: undefined,
    });

    const auth = cliAuth({ clientConfig: { secretKey: 'sk_test_xxx' } });
    await expect(auth.verifyToken(FAKE_OAUTH_TOKEN, { accepts: 'api_key' })).rejects.toThrow(/not accepted/i);
  });

  it('surfaces verifier errors from @clerk/backend as not_authenticated', async () => {
    mockedVerify.mockResolvedValueOnce({
      data: undefined,
      tokenType: 'oauth_token',
      errors: [{ message: 'OAuth token not found' }] as never,
    });

    const auth = cliAuth({ clientConfig: { secretKey: 'sk_test_xxx' } });
    await expect(auth.verifyToken(FAKE_OAUTH_TOKEN)).rejects.toThrow(/OAuth token not found/);
  });
});
