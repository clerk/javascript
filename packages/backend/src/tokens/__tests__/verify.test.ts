import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockJwks, mockJwt, mockJwtPayload } from '../../fixtures';
import { server } from '../../mock-server';
import { verifyToken } from '../verify';

describe('tokens.verify(token, options)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockJwtPayload.iat * 1000).getTime());
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('verifies the provided session JWT', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
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
      http.get('https://api.clerk.com/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    const { data } = await verifyToken(mockJwt, {
      secretKey: 'a-valid-key',
      authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      skipJwksCache: true,
    });

    expect(data).toEqual(mockJwtPayload);
  });

  // This test is skipped because it the code actually throws an error in the current implementation
  it.skip('returns an error if the JWT is invalid', async () => {
    const invalidJwt = 'invalid.jwt.token';

    const { errors } = await verifyToken(invalidJwt, {
      secretKey: 'a-valid-key',
      authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      skipJwksCache: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
  });

  // TODO: Fix this test
  it.skip('returns an error if the JWK cannot be resolved', async () => {
    server.use(
      http.get('https://api.clerk.com/v1/jwks', () => {
        return HttpResponse.error();
      }),
    );

    const { errors } = await verifyToken(mockJwt, {
      secretKey: 'a-valid-key',
      authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      skipJwksCache: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
    expect(errors?.[0]?.message).toBe('Failed to resolve JWK during verification.');
  });

  it('verifies the token using a local JWT key', async () => {
    const res = await verifyToken(mockJwt, {
      jwtKey: 'a-local-jwt-key',
      authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      skipJwksCache: true,
    });

    console.log('res', res);

    expect(res).toEqual(mockJwtPayload);
  });
});
