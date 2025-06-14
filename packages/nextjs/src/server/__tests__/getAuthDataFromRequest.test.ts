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
  it('returns unauthenticated machine object when token type does not match', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: undefined,
      tokenType: 'machine_token',
      errors: [
        {
          message: 'Token type mismatch',
          code: 'token-invalid',
          status: 401,
          name: 'MachineTokenVerificationError',
          getFullMessage: () => 'Token type mismatch',
        },
      ],
    });
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
    expect(auth.isAuthenticated).toBe(false);
  });

  it('returns invalid token auth object when token type does not match any in acceptsToken array', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: undefined,
      tokenType: 'machine_token',
      errors: [
        {
          message: 'Token type mismatch',
          code: 'token-invalid',
          status: 401,
          name: 'MachineTokenVerificationError',
          getFullMessage: () => 'Token type mismatch',
        },
      ],
    });
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

  it('returns authenticated object when token type exists in acceptsToken array', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: { id: 'ak_123', subject: 'user_12345' } as any,
      tokenType: 'api_key',
      errors: undefined,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_123',
      }),
    });

    const auth = await getAuthDataFromRequestAsync(req, {
      acceptsToken: ['api_key', 'machine_token'],
    });

    expect(auth.tokenType).toBe('api_key');
    expect((auth as AuthenticatedMachineObject<'api_key'>).id).toBe('ak_123');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('returns authenticated api_key object when token is valid and acceptsToken is api_key', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: { id: 'ak_123', subject: 'user_12345' } as any,
      tokenType: 'api_key',
      errors: undefined,
    });
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: `Bearer ak_123`,
      }),
    });
    const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: 'api_key' });
    expect(auth.tokenType).toBe('api_key');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('returns authenticated oauth_token object when token is valid and acceptsToken is oauth_token', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: { id: 'oat_123', subject: 'user_12345' } as any,
      tokenType: 'oauth_token',
      errors: undefined,
    });
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: `Bearer oat_123`,
      }),
    });
    const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: 'oauth_token' });
    expect(auth.tokenType).toBe('oauth_token');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('returns authenticated machine_token object when token is valid and acceptsToken is machine_token', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: { id: 'm2m_123', subject: 'mch_123' } as any,
      tokenType: 'machine_token',
      errors: undefined,
    });
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: `Bearer mt_123`,
      }),
    });
    const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: 'machine_token' });
    expect(auth.tokenType).toBe('machine_token');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('returns unauthenticated api_key object when token is invalid', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: undefined,
      tokenType: 'api_key',
      errors: machineTokenErrorMock as any,
    });
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: `Bearer ak_123`,
      }),
    });
    const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: 'api_key' });
    expect(auth.tokenType).toBe('api_key');
    expect(auth.isAuthenticated).toBe(false);
  });

  it('returns unauthenticated oauth_token object when token is invalid', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: undefined,
      tokenType: 'oauth_token',
      errors: machineTokenErrorMock as any,
    });
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: `Bearer oat_123`,
      }),
    });
    const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: 'oauth_token' });
    expect(auth.tokenType).toBe('oauth_token');
    expect(auth.isAuthenticated).toBe(false);
  });

  it('returns unauthenticated machine_token object when token is invalid', async () => {
    vi.mocked(verifyMachineAuthToken).mockResolvedValueOnce({
      data: undefined,
      tokenType: 'machine_token',
      errors: machineTokenErrorMock as any,
    });
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: `Bearer mt_123`,
      }),
    });
    const auth = await getAuthDataFromRequestAsync(req, { acceptsToken: 'machine_token' });
    expect(auth.tokenType).toBe('machine_token');
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
