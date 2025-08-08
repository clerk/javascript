import type { MachineAuthObject } from '@clerk/backend';
import type { AuthenticatedMachineObject, MachineTokenType, SignedOutAuthObject } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuthDataFromRequest } from '../data/getAuthDataFromRequest';
import { encryptClerkRequestData } from '../utils';

vi.mock(import('../constants.js'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    ENCRYPTION_KEY: 'encryption-key',
    PUBLISHABLE_KEY: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    SECRET_KEY: 'sk_test_xxxxxxxxxxxxxxxxxx',
  };
});

type MockRequestParams = {
  url: string;
  appendDevBrowserCookie?: boolean;
  method?: string;
  headers?: Headers;
  machineAuthObject?: Partial<MachineAuthObject<MachineTokenType>>;
};

const mockRequest = (params: MockRequestParams) => {
  const { url, appendDevBrowserCookie = false, method = 'GET', headers = new Headers(), machineAuthObject } = params;
  const headersWithCookie = new Headers(headers);

  if (appendDevBrowserCookie) {
    headersWithCookie.append('cookie', '__clerk_db_jwt=test_jwt');
  }

  // Add encrypted auth object header if provided
  if (machineAuthObject) {
    const encryptedData = encryptClerkRequestData(
      {}, // requestData
      {}, // keylessModeKeys
      // @ts-expect-error - mock machine auth object
      machineAuthObject,
    );
    if (encryptedData) {
      headersWithCookie.set(constants.Headers.ClerkRequestData, encryptedData);
    }
  }

  return new NextRequest(new URL(url, 'https://www.clerk.com').toString(), { method, headers: headersWithCookie });
};

// Helper function to create mock machine auth objects
const createMockMachineAuthObject = <T extends MachineTokenType>(data: Partial<MachineAuthObject<T>>) => data;

describe('getAuthDataFromRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns invalid token auth object when token type does not match any in acceptsToken array', () => {
    const machineAuthObject = createMockMachineAuthObject({
      tokenType: 'api_key',
      isAuthenticated: true,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
      machineAuthObject,
    });

    const auth = getAuthDataFromRequest(req, {
      acceptsToken: ['m2m_token', 'oauth_token', 'session_token'],
    });

    expect(auth.tokenType).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
  });

  it('handles mixed token types in acceptsToken array', () => {
    const machineAuthObject = createMockMachineAuthObject({
      tokenType: 'api_key',
      isAuthenticated: true,
      id: 'ak_id123',
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
      machineAuthObject,
    });

    const auth = getAuthDataFromRequest(req, {
      acceptsToken: ['api_key', 'session_token'],
    });

    expect(auth.tokenType).toBe('api_key');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('falls back to session logic when machine token is not accepted', () => {
    const machineAuthObject = createMockMachineAuthObject({
      tokenType: 'api_key',
      isAuthenticated: true,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
      machineAuthObject,
    });

    const auth = getAuthDataFromRequest(req, {
      acceptsToken: 'session_token',
    });

    expect(auth.tokenType).toBe('session_token');
    expect(auth.isAuthenticated).toBe(false);
  });

  it('returns unauthenticated auth object when token type does not match single acceptsToken', () => {
    const machineAuthObject = createMockMachineAuthObject({
      tokenType: 'api_key',
      isAuthenticated: true,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
      machineAuthObject,
    });

    const auth = getAuthDataFromRequest(req, { acceptsToken: 'oauth_token' });

    expect(auth.tokenType).toBe('oauth_token');
    expect(auth.isAuthenticated).toBe(false);
  });

  it('returns authenticated auth object for any valid token type', () => {
    const machineAuthObject = createMockMachineAuthObject({
      tokenType: 'api_key',
      id: 'ak_id123',
      isAuthenticated: true,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
      machineAuthObject,
    });

    const auth = getAuthDataFromRequest(req, { acceptsToken: 'any' });

    expect(auth.tokenType).toBe('api_key');
    expect((auth as AuthenticatedMachineObject<'api_key'>).id).toBe('ak_id123');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('returns authenticated object when token type exists in acceptsToken array', () => {
    const machineAuthObject = createMockMachineAuthObject({
      tokenType: 'api_key',
      id: 'ak_id123',
      subject: 'user_12345',
      isAuthenticated: true,
    });

    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_xxx',
      }),
      machineAuthObject,
    });

    const auth = getAuthDataFromRequest(req, {
      acceptsToken: ['api_key', 'm2m_token'],
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
      tokenType: 'm2m_token' as const,
      token: 'mt_123',
      data: { id: 'm2m_123', subject: 'mch_123' },
    },
  ])(
    'returns authenticated $tokenType object when token is valid and acceptsToken is $tokenType',
    ({ tokenType, token, data }) => {
      const machineAuthObject = createMockMachineAuthObject({
        tokenType,
        isAuthenticated: true,
        ...data,
      });

      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: `Bearer ${token}`,
        }),
        machineAuthObject,
      });

      const auth = getAuthDataFromRequest(req, { acceptsToken: tokenType });

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
      tokenType: 'm2m_token' as const,
      token: 'mt_123',
      data: undefined,
    },
  ])('returns unauthenticated $tokenType object when token is invalid', ({ tokenType, token }) => {
    const machineAuthObject = createMockMachineAuthObject({
      tokenType,
      isAuthenticated: false,
    });

    // For invalid tokens, we don't include encrypted auth object
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: `Bearer ${token}`,
      }),
      machineAuthObject,
    });

    const auth = getAuthDataFromRequest(req, { acceptsToken: tokenType });

    expect(auth.tokenType).toBe(tokenType);
    expect(auth.isAuthenticated).toBe(false);
  });

  it('falls back to session token handling when no encrypted auth object is present', () => {
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer session_xxx',
      }),
    });

    const auth = getAuthDataFromRequest(req);
    expect(auth.tokenType).toBe('session_token');
    expect((auth as SignedOutAuthObject).userId).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
  });

  it('only accepts session tokens when encrypted auth object is not present', () => {
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({
        [constants.Headers.Authorization]: 'Bearer ak_123',
      }),
    });

    const auth = getAuthDataFromRequest(req, {
      acceptsToken: 'api_key',
    });

    expect(auth.tokenType).toBe('session_token');
    expect((auth as SignedOutAuthObject).userId).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
  });
});
