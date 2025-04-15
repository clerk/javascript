import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('verifies M2M token', async () => {
    const token = 'm2m_test_token';
    const options = {
      apiUrl: 'https://api.clerk.test',
      secretKey: 'm2m_valid_secret',
      headers: {
        Authorization: 'Bearer m2m_valid_secret',
        'Clerk-API-Version': 'v1',
        'User-Agent': '@clerk/backend@0.0.0-test',
      },
    };

    server.use(
      http.post(
        'https://api.clerk.test/v1/m2m_tokens/verify',
        validateHeaders(() => {
          return HttpResponse.json({
            id: 'test_id',
            name: 'test_token',
            subject: 'test_subject',
            claims: {},
            secondsUntilExpiration: 3600,
            createdBy: null,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600,
            creationReason: null,
          });
        }),
      ),
    );

    const result = await verifyMachineAuthToken(token, options);
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBe('test_id');
  });
});
