import type { AuthenticatedMachineObject, SignedOutAuthObject } from '@clerk/backend/internal';
import { constants, verifyMachineAuthToken } from '@clerk/backend/internal';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const machineTokenErrorMock = [
  {
    message: 'Token type mismatch',
    code: 'token-invalid',
    status: 401,
    name: 'MachineTokenVerificationError',
    getFullMessage: () => 'Token type mismatch',
  },
];

describe('getAuthDataFromRequestAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('returns authenticated auth object for any valid token type', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: { id: 'ak_id123', subject: 'user_12345' } as any,
      tokenType: 'api_key',
      errors: undefined,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: 'any' });

    expect(auth.tokenType).toBe('api_key');
    expect((auth as AuthenticatedMachineObject<'api_key'>).id).toBe('ak_id123');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('returns authenticated object when token type exists in acceptsToken array', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: { id: 'ak_id123', subject: 'user_12345' } as any,
      tokenType: 'api_key',
      errors: undefined,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_secret123',
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req, {
      acceptsToken: ['api_key', 'machine_token'],
    });

    expect(auth.tokenType).toBe('api_key');
    expect((auth as AuthenticatedMachineObject<'api_key'>).id).toBe('ak_id123');
    expect(auth.isAuthenticated).toBe(true);
  });

  it.each([
    {
      tokenType: 'api_key' as const,
      token: 'ak_123',
      data: { id: 'ak_123', subject: 'user_12345' },
    },
    {
      tokenType: 'oauth_token' as const,
      token: 'oat_secret123',
      data: { id: 'oat_id123', subject: 'user_12345' },
    },
    {
      tokenType: 'machine_token' as const,
      token: 'mt_123',
      data: { id: 'm2m_123', subject: 'mch_123' },
    },
  ])(
    'returns authenticated $tokenType object when token is valid and acceptsToken is $tokenType',
    async ({ tokenType, token, data }) => {
      vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
        data: data as any,
        tokenType,
        errors: undefined,
      });

      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: `Bearer ${token}`,
        }),
      });

      const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: tokenType });

      expect(auth.tokenType).toBe(tokenType);
      expect(auth.isAuthenticated).toBe(true);
    },
  );

  it.each([
    {
      tokenType: 'api_key' as const,
      token: 'ak_123',
      data: undefined,
    },
    {
      tokenType: 'oauth_token' as const,
      token: 'oat_secret123',
      data: undefined,
    },
    {
      tokenType: 'machine_token' as const,
      token: 'mt_123',
      data: undefined,
    },
  ])('returns unauthenticated $tokenType object when token is invalid', async ({ tokenType, token, data }) => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: data as any,
      tokenType,
      errors: machineTokenErrorMock as any,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: `Bearer ${token}`,
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: tokenType });

    expect(auth.tokenType).toBe(tokenType);
    expect(auth.isAuthenticated).toBe(false);
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
    expect(auth.isAuthenticated).toBe(false);
  });
});

describe('getAuthDataFromRequestSync', () => {
  it('only accepts session tokens', () => {
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_123',
      }),
    });

    const auth = getAuthDataFromRequestSync(req, {
      acceptsToken: 'api_key',
    });

    expect(auth.tokenType).toBe('session_token');
    expect(auth.userId).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
  });
});
