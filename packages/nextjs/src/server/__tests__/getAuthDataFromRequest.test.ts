import type { AuthenticatedMachineObject, SignedOutAuthObject } from '@clerk/backend/internal';
import { constants, verifyMachineAuthToken } from '@clerk/backend/internal';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { getAuthDataFromRequestAsync, getAuthDataFromRequestSync } from '../data/getAuthDataFromRequest';

vi.mock('@clerk/backend/internal', async () => {
  const actual = await vi.importActual('@clerk/backend/internal');
  return {
    ...actual,
    verifyMachineAuthToken: vi.fn(),
  };
});

type MockRequestParams = {
  url: string;
  appendDevBrowserCookie?: boolean;
  method?: string;
  headers?: any;
};

const mockRequest = (params: MockRequestParams) => {
  const { url, appendDevBrowserCookie = false, method = 'GET', headers = new Headers() } = params;
  const headersWithCookie = new Headers(headers);
  if (appendDevBrowserCookie) {
    headersWithCookie.append('cookie', '__clerk_db_jwt=test_jwt');
  }
  return new NextRequest(new URL(url, 'https://www.clerk.com').toString(), { method, headers: headersWithCookie });
};

describe('getAuthDataFromRequestAsync', () => {
  it('returns unauthenticated machine object when token type does not match', async () => {
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req, {
      acceptsToken: 'machine_token',
    });

    expect(auth.tokenType).toBe('machine_token');
    expect((auth as AuthenticatedMachineObject<'machine_token'>).machineId).toBeNull();
  });

  it('returns invalid token auth object when token type does not match any in acceptsToken array', async () => {
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req, {
      acceptsToken: ['machine_token', 'oauth_token', 'session_token'],
    });

    expect(auth.tokenType).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
  });

  it('returns authenticated api_key object when array contains only api_key and token is ak_xxx and verification passes', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: { id: 'ak_123', subject: 'user_12345' } as any,
      tokenType: 'api_key',
      errors: undefined,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req, {
      acceptsToken: ['api_key'],
    });

    expect(auth.tokenType).toBe('api_key');
    expect((auth as AuthenticatedMachineObject<'api_key'>).id).toBe('ak_123');
  });

  it('returns authenticated machine object when token type matches', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: { id: 'ak_123', subject: 'user_12345' } as any,
      tokenType: 'api_key',
      errors: undefined,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req, {
      acceptsToken: 'api_key',
    });

    expect(auth.tokenType).toBe('api_key');
    expect((auth as AuthenticatedMachineObject<'api_key'>).id).toBe('ak_123');
  });

  it('falls back to session token handling', async () => {
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer session_xxx',
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req);
    expect(auth.tokenType).toBe('session_token');
    expect((auth as SignedOutAuthObject).userId).toBeNull();
  });
});

describe('getAuthDataFromRequestSync', () => {
  it('only accepts session tokens', () => {
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer api_key_xxx',
      }),
    });

    const auth = getAuthDataFromRequestSync(req, {
      acceptsToken: 'api_key',
    });

    expect(auth.tokenType).toBe('session_token');
    expect(auth.userId).toBeNull();
  });
});
