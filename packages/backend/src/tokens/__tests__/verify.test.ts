import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { APIKey, IdPOAuthAccessToken, M2MToken } from '../../api';
import { createJwt, mockJwks, mockJwt, mockJwtPayload, mockOAuthAccessTokenJwtPayload } from '../../fixtures';
import {
  mockSignedOAuthAccessTokenJwt,
  mockSignedOAuthAccessTokenJwtApplicationTyp,
  mockVerificationResults,
} from '../../fixtures/machine';
import { server, validateHeaders } from '../../mock-server';
import { verifyMachineAuthToken, verifyToken } from '../verify';

function createOAuthJwt(
  payload = mockOAuthAccessTokenJwtPayload,
  typ: 'at+jwt' | 'application/at+jwt' | 'JWT' = 'at+jwt',
) {
  return createJwt({
    header: { typ, kid: 'ins_2GIoQhbUpy0hX7B2cVkuTMinXoD' },
    payload,
  });
}

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

  describe('verifyOAuthToken with JWT', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(mockJwtPayload.iat * 1000));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('verifies a valid OAuth JWT', async () => {
      server.use(
        http.get(
          'https://api.clerk.test/v1/jwks',
          validateHeaders(() => {
            return HttpResponse.json(mockJwks);
          }),
        ),
      );

      const result = await verifyMachineAuthToken(mockSignedOAuthAccessTokenJwt, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('oauth_token');
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();

      const data = result.data as IdPOAuthAccessToken;
      expect(data.id).toBe('oat_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE');
      expect(data.clientId).toBe('client_2VTWUzvGC5UhdJCNx6xG1D98edc');
      expect(data.type).toBe('oauth_token');
      expect(data.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(data.scopes).toEqual(['read:foo', 'write:bar']);
    });

    it('fails if JWT type is not at+jwt or application/at+jwt', async () => {
      server.use(
        http.get(
          'https://api.clerk.test/v1/jwks',
          validateHeaders(() => {
            return HttpResponse.json(mockJwks);
          }),
        ),
      );

      const oauthJwt = createOAuthJwt(mockOAuthAccessTokenJwtPayload, 'JWT');

      const result = await verifyMachineAuthToken(oauthJwt, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain('Invalid JWT type');
    });

    it('verifies JWT with typ application/at+jwt', async () => {
      server.use(
        http.get(
          'https://api.clerk.test/v1/jwks',
          validateHeaders(() => {
            return HttpResponse.json(mockJwks);
          }),
        ),
      );

      const result = await verifyMachineAuthToken(mockSignedOAuthAccessTokenJwtApplicationTyp, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('oauth_token');
      expect(result.errors).toBeUndefined();
    });

    it('handles invalid JWT format', async () => {
      const invalidJwt = 'invalid.jwt.token';

      const result = await verifyMachineAuthToken(invalidJwt, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.errors).toBeDefined();
    });

    it('rejects JWT with alg: none', async () => {
      server.use(
        http.get(
          'https://api.clerk.test/v1/jwks',
          validateHeaders(() => {
            return HttpResponse.json(mockJwks);
          }),
        ),
      );

      const oauthJwt = createJwt({
        header: { typ: 'at+jwt', alg: 'none', kid: 'ins_2GIoQhbUpy0hX7B2cVkuTMinXoD' },
        payload: mockOAuthAccessTokenJwtPayload,
      });

      const result = await verifyMachineAuthToken(oauthJwt, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain('Invalid JWT algorithm');
    });

    it('rejects expired JWT', async () => {
      server.use(
        http.get(
          'https://api.clerk.test/v1/jwks',
          validateHeaders(() => {
            return HttpResponse.json(mockJwks);
          }),
        ),
      );

      const expiredPayload = {
        ...mockOAuthAccessTokenJwtPayload,
        exp: mockOAuthAccessTokenJwtPayload.iat - 100,
      };

      const oauthJwt = createOAuthJwt(expiredPayload, 'at+jwt');

      const result = await verifyMachineAuthToken(oauthJwt, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain('expired');
    });
  });
});
