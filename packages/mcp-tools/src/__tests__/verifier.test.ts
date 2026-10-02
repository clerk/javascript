import { OAuthError, OAuthErrorCode } from '@modelcontextprotocol/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyMachineAuthToken } = vi.hoisted(() => ({ verifyMachineAuthToken: vi.fn() }));

vi.mock('@clerk/backend/internal', () => ({ verifyMachineAuthToken }));

import { boundResource, createClerkOAuthTokenVerifier } from '../verifier';
import { jwt, RESOURCE } from './helpers';

const accessToken = {
  id: 'oat_123',
  clientId: 'client_123',
  type: 'oauth_token',
  subject: 'user_123',
  scopes: ['notes:read'],
  revoked: false,
  revocationReason: null,
  expired: false,
  expiration: 1_800_000_000_999,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

function verified(overrides: Partial<typeof accessToken> & { aud?: string[] } = {}) {
  verifyMachineAuthToken.mockResolvedValue({
    data: { ...accessToken, ...overrides },
    tokenType: 'oauth_token',
    errors: undefined,
  });
}

async function failure(promise: Promise<unknown>) {
  return promise.then(
    () => undefined,
    error => error as unknown,
  );
}

describe('createClerkOAuthTokenVerifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps a verified Clerk access token to MCP auth info', async () => {
    verified();
    const token = jwt({ aud: RESOURCE });
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123', resource: RESOURCE });

    await expect(verifier.verifyAccessToken(token)).resolves.toEqual({
      token,
      clientId: 'client_123',
      scopes: ['notes:read'],
      expiresAt: 1_800_000_000,
      resource: new URL(RESOURCE),
      extra: { userId: 'user_123', accessTokenId: 'oat_123' },
    });
    expect(verifyMachineAuthToken).toHaveBeenCalledWith(token, { secretKey: 'sk_test_123' });
  });

  it.each([
    ['issued for another resource', jwt({ aud: 'https://other.example.com/mcp' })],
    ['without an audience', jwt({ sub: 'user_123' })],
    ['that is opaque and carries no audience', 'oat_opaque'],
  ])('refuses a token %s when a resource is configured', async (_name, token) => {
    verified();
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123', resource: RESOURCE });

    await expect(verifier.verifyAccessToken(token)).rejects.toMatchObject({ code: OAuthErrorCode.InvalidToken });
  });

  it('binds an opaque token through the audience the Backend API verified', async () => {
    verified({ aud: [RESOURCE] });
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123' });

    const authInfo = await verifier.verifyAccessToken('oat_opaque');

    expect(authInfo.resource).toEqual(new URL(RESOURCE));
  });

  it('prefers the verified audience over the one a JWT claims', async () => {
    verified({ aud: ['https://other.example.com/mcp'] });
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123' });

    const authInfo = await verifier.verifyAccessToken(jwt({ aud: RESOURCE }));

    expect(authInfo.resource).toEqual(new URL('https://other.example.com/mcp'));
  });

  it('leaves the resource undefined for an opaque token when @clerk/backend reports no audience', async () => {
    verified();
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123' });

    const authInfo = await verifier.verifyAccessToken('oat_opaque');

    expect(authInfo.resource).toBeUndefined();
  });

  it.each([
    ['revoked', { revoked: true }],
    ['expired', { expired: true }],
    ['non-expiring', { expiration: null }],
  ])('rejects a %s token as invalid', async (_state, overrides) => {
    verified(overrides as Partial<typeof accessToken>);
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123' });

    const error = await failure(verifier.verifyAccessToken('oat_opaque'));

    expect(OAuthError.isInstance(error)).toBe(true);
    expect(error).toMatchObject({ code: OAuthErrorCode.InvalidToken });
  });

  it('rejects machine tokens of another type', async () => {
    verifyMachineAuthToken.mockResolvedValue({ data: { id: 'ak_1' }, tokenType: 'api_key', errors: undefined });
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123' });

    await expect(verifier.verifyAccessToken('ak_secret')).rejects.toMatchObject({ code: OAuthErrorCode.InvalidToken });
  });

  it.each(['token-invalid', 'token-verification-failed'])(
    'maps a %s verification error to invalid_token',
    async code => {
      verifyMachineAuthToken.mockResolvedValue({ data: undefined, tokenType: 'oauth_token', errors: [{ code }] });
      const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123' });

      await expect(verifier.verifyAccessToken('oat_opaque')).rejects.toMatchObject({
        code: OAuthErrorCode.InvalidToken,
      });
    },
  );

  it.each(['secret-key-invalid', 'unexpected-error'])('surfaces a %s error as a server error', async code => {
    verifyMachineAuthToken.mockResolvedValue({ data: undefined, tokenType: 'oauth_token', errors: [{ code }] });
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123' });

    await expect(verifier.verifyAccessToken('oat_opaque')).rejects.toMatchObject({ code: OAuthErrorCode.ServerError });
  });

  it('rejects tokens the SDK cannot classify', async () => {
    verifyMachineAuthToken.mockRejectedValue(new Error('Unknown machine token type'));
    const verifier = createClerkOAuthTokenVerifier({ secretKey: 'sk_test_123' });

    await expect(verifier.verifyAccessToken('not-a-token')).rejects.toMatchObject({
      code: OAuthErrorCode.InvalidToken,
    });
  });
});

describe('boundResource', () => {
  it.each([
    ['no audience', undefined],
    ['an empty audience list', []],
    ['several audiences', [RESOURCE, 'https://other.example.com/mcp']],
    ['a non-URL audience', 'not a url'],
    ['a numeric audience', 42],
  ])('returns undefined for %s', (_name, audience) => {
    expect(boundResource(audience)).toBeUndefined();
  });

  it('returns the single bound resource', () => {
    expect(boundResource(RESOURCE)).toEqual(new URL(RESOURCE));
    expect(boundResource([RESOURCE])).toEqual(new URL(RESOURCE));
  });
});
