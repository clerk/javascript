import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockJwks, mockJwt, mockJwtPayload } from '../../fixtures';
import { server } from '../../mock-server';
import { verifyToken } from '../verify';

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
});
