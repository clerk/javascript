import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { APIKey, IdPOAuthAccessToken, MachineToken } from '../../api';
import { ObjectType } from '../../api';
import { mockJwks, mockJwt, mockJwtPayload } from '../../fixtures';
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
    const token = 'api_key_LCWGdaM8mv8K4PC/57IICZQXAeWfCgF30DZaFXHoGn9=';

    server.use(
      http.post(
        'https://api.clerk.test/v1/api_keys/verify',
        validateHeaders(() => {
          return HttpResponse.json({
            object: ObjectType.ApiKey,
            id: 'api_key_ey966f1b1xf93586b2debdcadb0b3bd1',
            type: 'api_key',
            name: 'my-api-key',
            subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
            claims: { foo: 'bar' },
            scopes: ['read:users', 'write:users'],
            createdBy: null,
            creationReason: 'For testing purposes',
            secondsUntilExpiration: null,
            createdAt: 1745185445567,
            expiresAt: 1745185445567,
          });
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
    expect(data.id).toBe('api_key_ey966f1b1xf93586b2debdcadb0b3bd1');
    expect(data.name).toBe('my-api-key');
    expect(data.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
    expect(data.scopes).toEqual(['read:users', 'write:users']);
    expect(data.claims).toEqual({ foo: 'bar' });
  });

  it('verifies provided Machine token', async () => {
    const token = 'm2m_8XOIucKvqHVr5tYP123456789abcdefghij';

    server.use(
      http.post(
        'https://api.clerk.test/v1/m2m_tokens/verify',
        validateHeaders(() => {
          return HttpResponse.json({
            object: ObjectType.MachineToken,
            id: 'm2m_ey966f1b1xf93586b2debdcadb0b3bd1',
            name: 'my-machine-token',
            subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
            claims: { foo: 'bar' },
            scopes: ['read:users', 'write:users'],
            revoked: false,
            expired: false,
            expiration: 1745185445567,
            createdBy: null,
            creationReason: 'For testing purposes',
            createdAt: 1745185445567,
            updatedAt: 1745185445567,
          });
        }),
      ),
    );

    const result = await verifyMachineAuthToken(token, {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'a-valid-key',
    });

    expect(result.tokenType).toBe('machine_token');
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();

    const data = result.data as MachineToken;
    expect(data.id).toBe('m2m_ey966f1b1xf93586b2debdcadb0b3bd1');
    expect(data.name).toBe('my-machine-token');
    expect(data.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
    expect(data.scopes).toEqual(['read:users', 'write:users']);
    expect(data.claims).toEqual({ foo: 'bar' });
  });

  it('verifies provided OAuth token', async () => {
    const token = 'oauth_access_8XOIucKvqHVr5tYP123456789abcdefghij';

    server.use(
      http.post(
        'https://api.clerk.test/v1/oauth_applications/access_tokens/verify',
        validateHeaders(() => {
          return HttpResponse.json({
            object: ObjectType.IdpOAuthAccessToken,
            id: 'oauth_access_2VTWUzvGC5UhdJCNx6xG1D98edc',
            type: 'oauth:access_token',
            name: 'GitHub OAuth',
            subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
            claims: { scope: 'read write' },
            scopes: ['read:users', 'write:users'],
            createdAt: 1744928754551,
            expiresAt: 1744928754551,
          });
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
    expect(data.id).toBe('oauth_access_2VTWUzvGC5UhdJCNx6xG1D98edc');
    expect(data.name).toBe('GitHub OAuth');
    expect(data.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
    expect(data.scopes).toEqual(['read:users', 'write:users']);
  });

  describe('handles API errors for API keys', () => {
    it('handles invalid token', async () => {
      const token = 'api_key_invalid_token';

      server.use(
        http.post('https://api.clerk.test/v1/api_keys/verify', () => {
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
      const token = 'api_key_ey966f1b1xf93586b2debdcadb0b3bd1';

      server.use(
        http.post('https://api.clerk.test/v1/api_keys/verify', () => {
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
      const token = 'm2m_invalid_token';

      server.use(
        http.post('https://api.clerk.test/v1/m2m_tokens/verify', () => {
          return HttpResponse.json({}, { status: 404 });
        }),
      );

      const result = await verifyMachineAuthToken(token, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('machine_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('Machine token not found');
      expect(result.errors?.[0].code).toBe('token-invalid');
    });

    it('handles unexpected error', async () => {
      const token = 'm2m_ey966f1b1xf93586b2debdcadb0b3bd1';

      server.use(
        http.post('https://api.clerk.test/v1/m2m_tokens/verify', () => {
          return HttpResponse.json({}, { status: 500 });
        }),
      );

      const result = await verifyMachineAuthToken(token, {
        apiUrl: 'https://api.clerk.test',
        secretKey: 'a-valid-key',
      });

      expect(result.tokenType).toBe('machine_token');
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('Unexpected error');
      expect(result.errors?.[0].code).toBe('unexpected-error');
    });
  });

  describe('handles API errors for OAuth tokens', () => {
    it('handles invalid token', async () => {
      const token = 'oauth_access_invalid_token';

      server.use(
        http.post('https://api.clerk.test/v1/oauth_applications/access_tokens/verify', () => {
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
      const token = 'oauth_access_8XOIucKvqHVr5tYP123456789abcdefghij';

      server.use(
        http.post('https://api.clerk.test/v1/oauth_applications/access_tokens/verify', () => {
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
});
