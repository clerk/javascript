import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { APIKey, IdPOAuthAccessToken, M2MToken } from '../../api';
import { createJwt, mockJwks, mockJwt, mockJwtPayload, mockRsaJwkKid, pemEncodedPublicKey } from '../../fixtures';
import { mockVerificationResults } from '../../fixtures/machine';
import { server, validateHeaders } from '../../mock-server';
import { verifyMachineAuthToken, verifyToken } from '../verify';

describe('tokens.verify(token, options)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockJwtPayload.iat * 1000));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('verifies the provided session JWT', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    const { data } = await verifyToken(mockJwt, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
      authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      skipJwksCache: true,
    });

    expect(data).toEqual(mockJwtPayload);
  });

  it('verifies the token by fetching the JWKs from Backend API when secretKey is provided', async () => {
    server.use(
      http.get(
        'https://api.clerk.com/v1/jwks',
        validateHeaders(() => {
          return HttpResponse.json(mockJwks);
        }),
      ),
    );

    const { data } = await verifyToken(mockJwt, {
      secretKey: 'a-valid-key',
      authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      skipJwksCache: true,
    });

    expect(data).toEqual(mockJwtPayload);
  });
});

describe('tokens.verifyMachineAuthToken(token, options)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const now = new Date(2023, 0, 1).getTime();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
    server.resetHandlers();
  });

  it('verifies provided API key', async () => {
    const token = 'ak_LCWGdaM8mv8K4PC/57IICZQXAeWfCgF30DZaFXHoGn9=';

    server.use(
      http.post(
        'https://api.clerk.test/api_keys/verify',
        validateHeaders(() => {
          return HttpResponse.json(mockVerificationResults.api_key);
        }),
      ),
    );

    const result = await verifyMachineAuthToken(token, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
    });

    expect(result.tokenType).toBe('api_key');
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();

    const data = result.data as APIKey;
    expect(data.id).toBe('ak_ey966f1b1xf93586b2debdcadb0b3bd1');
    expect(data.name).toBe('my-api-key');
    expect(data.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
    expect(data.scopes).toEqual(['read:foo', 'write:bar']);
    expect(data.claims).toEqual({ foo: 'bar' });
  });

  it('verifies provided Machine token with instance secret key', async () => {
    const token = 'mt_8XOIucKvqHVr5tYP123456789abcdefghij';

    server.use(
      http.post(
        'https://api.clerk.test/m2m_tokens/verify',
        validateHeaders(() => {
          return HttpResponse.json(mockVerificationResults.m2m_token);
        }),
      ),
    );

    const result = await verifyMachineAuthToken(token, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
    });

    expect(result.tokenType).toBe('m2m_token');
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();

    const data = result.data as M2MToken;
    expect(data.id).toBe('m2m_ey966f1b1xf93586b2debdcadb0b3bd1');
    expect(data.subject).toBe('mch_2vYVtestTESTtestTESTtestTESTtest');
    expect(data.claims).toEqual({ foo: 'bar' });
    expect(data.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
  });

  it('verifies provided Machine token with machine secret', async () => {
    const token = 'mt_8XOIucKvqHVr5tYP123456789abcdefghij';

    server.use(
      http.post(
        'https://api.clerk.test/m2m_tokens/verify',
        validateHeaders(({ request }) => {
          expect(request.headers.get('Authorization')).toBe('Bearer ak_xxxxx');
          return HttpResponse.json(mockVerificationResults.m2m_token);
        }),
      ),
    );

    const result = await verifyMachineAuthToken(token, {
      apiUrl: 'https://api.clerk.test',
      // @ts-expect-error: Machine secret key is only visible in createClerkClient()
      machineSecretKey: 'ak_xxxxx',
    });

    expect(result.tokenType).toBe('m2m_token');
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();

    const data = result.data as M2MToken;
    expect(data.id).toBe('m2m_ey966f1b1xf93586b2debdcadb0b3bd1');
    expect(data.subject).toBe('mch_2vYVtestTESTtestTESTtestTESTtest');
    expect(data.claims).toEqual({ foo: 'bar' });
    expect(data.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
  });

  it('verifies provided OAuth token', async () => {
    const token = 'oat_8XOIucKvqHVr5tYP123456789abcdefghij';

    server.use(
      http.post(
        'https://api.clerk.test/oauth_applications/access_tokens/verify',
        validateHeaders(() => {
          return HttpResponse.json(mockVerificationResults.oauth_token);
        }),
      ),
    );

    const result = await verifyMachineAuthToken(token, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
    });

    expect(result.tokenType).toBe('oauth_token');
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();

    const data = result.data as IdPOAuthAccessToken;
    expect(data.id).toBe('oat_2VTWUzvGC5UhdJCNx6xG1D98edc');
    expect(data.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
    expect(data.scopes).toEqual(['read:foo', 'write:bar']);
  });

  describe('handles API errors for API keys', () => {
    it('handles invalid token', async () => {
      const token = 'ak_invalid_token';

      server.use(
        http.post('https://api.clerk.test/api_keys/verify', () => {
          return HttpResponse.json({}, { status: 404 });
        }),
      );

      const result = await verifyMachineAuthToken(token, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('api_key');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('API key not found');
      expect(result.errors?.[0].code).toBe('token-invalid');
    });

    it('handles unexpected error', async () => {
      const token = 'ak_ey966f1b1xf93586b2debdcadb0b3bd1';

      server.use(
        http.post('https://api.clerk.test/api_keys/verify', () => {
          return HttpResponse.json({}, { status: 500 });
        }),
      );

      const result = await verifyMachineAuthToken(token, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('api_key');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('Unexpected error');
      expect(result.errors?.[0].code).toBe('unexpected-error');
    });
  });

  describe('handles API errors for M2M tokens', () => {
    it('handles invalid token', async () => {
      const token = 'mt_invalid_token';

      server.use(
        http.post('https://api.clerk.test/m2m_tokens/verify', () => {
          return HttpResponse.json({}, { status: 404 });
        }),
      );

      const result = await verifyMachineAuthToken(token, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('m2m_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('Machine token not found');
      expect(result.errors?.[0].code).toBe('token-invalid');
    });

    it('handles unexpected error', async () => {
      const token = 'mt_ey966f1b1xf93586b2debdcadb0b3bd1';

      server.use(
        http.post('https://api.clerk.test/m2m_tokens/verify', () => {
          return HttpResponse.json({}, { status: 500 });
        }),
      );

      const result = await verifyMachineAuthToken(token, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('m2m_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('Unexpected error');
      expect(result.errors?.[0].code).toBe('unexpected-error');
    });
  });

  describe('handles API errors for OAuth tokens', () => {
    it('handles invalid token', async () => {
      const token = 'oat_invalid_token';

      server.use(
        http.post('https://api.clerk.test/oauth_applications/access_tokens/verify', () => {
          return HttpResponse.json({}, { status: 404 });
        }),
      );

      const result = await verifyMachineAuthToken(token, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('oauth_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('OAuth token not found');
      expect(result.errors?.[0].code).toBe('token-invalid');
    });

    it('handles unexpected error', async () => {
      const token = 'oat_8XOIucKvqHVr5tYP123456789abcdefghij';

      server.use(
        http.post('https://api.clerk.test/oauth_applications/access_tokens/verify', () => {
          return HttpResponse.json({}, { status: 500 });
        }),
      );

      const result = await verifyMachineAuthToken(token, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('oauth_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('Unexpected error');
      expect(result.errors?.[0].code).toBe('unexpected-error');
    });
  });

  describe('OAuth JWT tokens (at+jwt header type)', () => {
    it('rejects session JWT as unknown machine token type', async () => {
      // mockJwt has typ: JWT (session token header), not at+jwt (OAuth token header)
      // So it should fail as unknown machine token type when passed to verifyMachineAuthToken
      await expect(
        verifyMachineAuthToken(mockJwt, {
          apiUrl: 'https://api.clerk.test',
          secretKey: 'a-valid-key',
          skipJwksCache: true,
        }),
      ).rejects.toThrow('Unknown machine token type');
    });

    it('returns error for JWT with wrong typ header (JWT instead of at+jwt)', async () => {
      // Create a JWT with typ: JWT (session token type, not OAuth)
      const jwtWithWrongTyp = createJwt({
        header: { typ: 'JWT', kid: mockRsaJwkKid },
        payload: {
          jti: 'oat_test_wrong_typ',
          client_id: 'client_test_id',
          sub: 'user_test_id',
          scope: 'read:user',
          exp: Date.now() / 1000 + 3600,
          iat: Date.now() / 1000,
        },
      });

      // A JWT with typ: JWT should be rejected as unknown machine token type
      await expect(
        verifyMachineAuthToken(jwtWithWrongTyp, {
          jwtKey: pemEncodedPublicKey,
          apiUrl: 'https://api.clerk.test',
          secretKey: 'a-valid-key',
        }),
      ).rejects.toThrow('Unknown machine token type');
    });

    it('returns error for JWT without typ header', async () => {
      // Create a JWT without typ header
      const jwtWithoutTyp = createJwt({
        header: { typ: undefined, kid: mockRsaJwkKid },
        payload: {
          jti: 'oat_test_no_typ',
          client_id: 'client_test_id',
          sub: 'user_test_id',
          scope: 'read:user',
          exp: Date.now() / 1000 + 3600,
          iat: Date.now() / 1000,
        },
      });

      // A JWT without typ header should be rejected as unknown machine token type
      await expect(
        verifyMachineAuthToken(jwtWithoutTyp, {
          jwtKey: pemEncodedPublicKey,
          apiUrl: 'https://api.clerk.test',
          secretKey: 'a-valid-key',
        }),
      ).rejects.toThrow('Unknown machine token type');
    });

    it('returns error for OAuth JWT with invalid typ header (at+jwt)', async () => {
      // Create a JWT with at+jwt header - this will be detected as OAuth JWT
      // but when we try to verify it, it will fail because signature doesn't match
      const oauthJwt = createJwt({
        header: { typ: 'at+jwt', kid: mockRsaJwkKid },
        payload: {
          jti: 'oat_test_jwt_id',
          client_id: 'client_test_id',
          sub: 'user_test_id',
          scope: 'read:user',
          exp: Date.now() / 1000 + 3600,
          iat: Date.now() / 1000,
        },
      });

      const result = await verifyMachineAuthToken(oauthJwt, {
        jwtKey: pemEncodedPublicKey,
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('oauth_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      // The error should be about invalid signature since createJwt uses a mock signature
      expect(result.errors?.[0].message).toContain('signature');
    });

    it('returns error for expired OAuth JWT', async () => {
      // Create an expired OAuth JWT
      const expiredOauthJwt = createJwt({
        header: { typ: 'at+jwt', kid: mockRsaJwkKid },
        payload: {
          jti: 'oat_test_expired',
          client_id: 'client_test_id',
          sub: 'user_test_id',
          scope: 'read:user',
          exp: Date.now() / 1000 - 3600, // Expired 1 hour ago
          iat: Date.now() / 1000 - 7200,
        },
      });

      const result = await verifyMachineAuthToken(expiredOauthJwt, {
        jwtKey: pemEncodedPublicKey,
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('oauth_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      // The error message should indicate the token is expired
      expect(result.errors?.[0].message).toContain('expired');
    });

    it('returns error for OAuth JWT with alg=none', async () => {
      // Create a JWT with alg: none (insecure algorithm that should be rejected)
      const jwtWithAlgNone = createJwt({
        header: { typ: 'at+jwt', alg: 'none', kid: mockRsaJwkKid },
        payload: {
          jti: 'oat_test_alg_none',
          client_id: 'client_test_id',
          sub: 'user_test_id',
          scope: 'read:user',
          exp: Date.now() / 1000 + 3600,
          iat: Date.now() / 1000,
        },
        signature: '', // alg=none tokens have empty signature
      });

      const result = await verifyMachineAuthToken(jwtWithAlgNone, {
        jwtKey: pemEncodedPublicKey,
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('oauth_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      // The error should be about invalid algorithm
      expect(result.errors?.[0].message).toContain('algorithm');
    });

    it('detects OAuth JWT by application/at+jwt header type', async () => {
      // Create a JWT with application/at+jwt header (alternative valid type per RFC 9068)
      const oauthJwt = createJwt({
        header: { typ: 'application/at+jwt', kid: mockRsaJwkKid },
        payload: {
          jti: 'oat_test_app_at_jwt',
          client_id: 'client_test_id',
          sub: 'user_test_id',
          scope: 'read:user',
          exp: Date.now() / 1000 + 3600,
          iat: Date.now() / 1000,
        },
      });

      const result = await verifyMachineAuthToken(oauthJwt, {
        jwtKey: pemEncodedPublicKey,
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      // Should be detected as OAuth token by the header type
      expect(result.tokenType).toBe('oauth_token');
      // Will have errors due to signature mismatch, but it was correctly identified as OAuth
      expect(result.errors).toBeDefined();
    });
  });
});
