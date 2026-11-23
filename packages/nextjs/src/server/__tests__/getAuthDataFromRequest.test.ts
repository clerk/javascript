import type { AuthObject, MachineAuthObject } from '@clerk/backend';
import type {
  AuthenticatedMachineObject,
  MachineTokenType,
  RequestState,
  SignedOutAuthObject,
} from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest } from '@clerk/backend/internal';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HmacSHA1 } from '../../vendor/crypto-es';
import { getAuthDataFromRequest } from '../data/getAuthDataFromRequest';
import { decorateRequest, encryptClerkRequestData } from '../utils';

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
  const machineToken = headers.get(constants.Headers.Authorization)?.replace('Bearer ', '') ?? '';
  const headersWithCookie = new Headers(headers);

  if (appendDevBrowserCookie) {
    headersWithCookie.append('cookie', '__clerk_db_jwt=test_jwt');
  }

  // Add encrypted auth object header if provided
  if (machineAuthObject) {
    const encryptedData = encryptClerkRequestData(
      {}, // requestData
      {}, // keylessModeKeys
      {
        // @ts-expect-error - mock machine auth object
        authObject: machineAuthObject,
        tokenSignature: HmacSHA1(machineToken, 'sk_test_xxxxxxxxxxxxxxxxxx').toString(),
      },
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

  it('rejects a forwarded machine auth object without a token signature', () => {
    const encryptedData = encryptClerkRequestData(
      {},
      {},
      // @ts-expect-error - payload from a build that did not sign the token
      { authObject: { tokenType: 'api_key', isAuthenticated: true, id: 'ak_id' } },
    );
    const req = new NextRequest('https://www.clerk.com/api/protected', {
      headers: {
        [constants.Headers.Authorization]: 'Bearer ak_verified',
        [constants.Headers.ClerkRequestData]: encryptedData!,
      },
    });

    expect(() => getAuthDataFromRequest(req, { acceptsToken: 'api_key' })).toThrow(/auth_signature_invalid/);
  });

  it('returns an unauthenticated machine auth object that middleware forwarded without a token signature', () => {
    const encryptedData = encryptClerkRequestData(
      {},
      {},
      // @ts-expect-error - mock machine auth object
      { authObject: { tokenType: 'api_key', isAuthenticated: false, id: null }, tokenSignature: '' },
    );
    const req = new NextRequest('https://www.clerk.com/api/protected', {
      headers: {
        [constants.Headers.Authorization]: 'Bearer ak_invalid',
        [constants.Headers.ClerkRequestData]: encryptedData!,
      },
    });

    const auth = getAuthDataFromRequest(req, { acceptsToken: 'api_key' });

    expect(auth.tokenType).toBe('api_key');
    expect(auth.isAuthenticated).toBe(false);
  });

  it('redacts debug data of a machine auth object', () => {
    const req = mockRequest({
      url: '/api/protected',
      headers: new Headers({ [constants.Headers.Authorization]: 'Bearer ak_xxx' }),
      machineAuthObject: createMockMachineAuthObject({ tokenType: 'api_key', isAuthenticated: true }),
    });

    const auth = getAuthDataFromRequest(req, { acceptsToken: 'api_key' });

    expect(auth.debug().secretKey).toBe('sk_test');
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
      data: { id: 'mt_123', subject: 'mch_123' },
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

  describe('JWT-format machine token rejection', () => {
    // Constructs a JWT-format M2M token (sub: 'mch_...') without an encrypted auth object.
    // This simulates a request that bypasses middleware and sends a raw JWT-format M2M token.
    const toBase64Url = (str: string) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const mockM2MJwt = [
      toBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
      toBase64Url(JSON.stringify({ sub: 'mch_testmachine123', exp: 9999999999, iat: 1666648250 })),
      toBase64Url('signature'),
    ].join('.');

    it('returns signed-out when JWT-format M2M token is sent to a session-only endpoint', () => {
      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: `Bearer ${mockM2MJwt}`,
        }),
      });

      const auth = getAuthDataFromRequest(req, { acceptsToken: 'session_token' });

      expect(auth.tokenType).toBe('session_token');
      expect((auth as SignedOutAuthObject).userId).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
    });

    it('returns signed-out when JWT-format M2M token is sent with default (session) acceptsToken', () => {
      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: `Bearer ${mockM2MJwt}`,
        }),
      });

      const auth = getAuthDataFromRequest(req);

      expect(auth.tokenType).toBe('session_token');
      expect((auth as SignedOutAuthObject).userId).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
    });

    it('returns signed-out when JWT-format M2M token is sent but no encrypted auth object is present', () => {
      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: `Bearer ${mockM2MJwt}`,
        }),
      });

      // m2m_token is accepted but no encrypted machineAuthObject was set by middleware
      const auth = getAuthDataFromRequest(req, { acceptsToken: ['api_key', 'm2m_token'] });

      expect(auth.isAuthenticated).toBe(false);
    });

    it('returns signed-out when a verified JWT-format M2M token is sent with a padded Authorization header', () => {
      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: `Bearer ${mockM2MJwt} x`,
          [constants.Headers.AuthStatus]: AuthStatus.SignedIn,
          [constants.Headers.AuthToken]: mockM2MJwt,
          [constants.Headers.AuthSignature]: HmacSHA1(mockM2MJwt, 'sk_test_xxxxxxxxxxxxxxxxxx').toString(),
        }),
        machineAuthObject: createMockMachineAuthObject({ tokenType: 'm2m_token', isAuthenticated: true }),
      });

      const auth = getAuthDataFromRequest(req);

      expect(auth.tokenType).toBe('session_token');
      expect((auth as SignedOutAuthObject).userId).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
    });
  });

  describe('machine auth object forwarded by decorateRequest', () => {
    // Runs the real middleware handoff with a dynamic secret key and returns the request auth() would see.
    const forwardFromMiddleware = (verifiedToken: string) => {
      const clerkRequest = createClerkRequest(
        new Request('https://www.clerk.com/api/protected', {
          headers: { [constants.Headers.Authorization]: `Bearer ${verifiedToken}` },
        }),
      );
      const res = decorateRequest(
        clerkRequest,
        NextResponse.next(),
        { status: AuthStatus.SignedIn, token: verifiedToken, reason: null, message: null } as unknown as RequestState,
        { secretKey: 'sk_test_dynamic' },
        {},
        { tokenType: 'api_key', isAuthenticated: true, id: 'ak_id' } as unknown as AuthObject,
      );

      const headers = new Headers();
      res.headers.forEach((value, key) => {
        if (key.startsWith('x-middleware-request-')) {
          headers.set(key.slice('x-middleware-request-'.length), value);
        }
      });
      return headers;
    };

    it('authenticates the token middleware verified', async () => {
      const req = new NextRequest('https://www.clerk.com/api/protected', {
        headers: forwardFromMiddleware('ak_verified'),
      });

      const auth = getAuthDataFromRequest(req, { acceptsToken: 'api_key' });

      expect(auth.isAuthenticated).toBe(true);
      expect(await auth.getToken()).toBe('ak_verified');
    });

    it('rejects a different bearer token', () => {
      const headers = forwardFromMiddleware('ak_verified');
      headers.set(constants.Headers.Authorization, 'Bearer ak_other');
      const req = new NextRequest('https://www.clerk.com/api/protected', { headers });

      expect(() => getAuthDataFromRequest(req, { acceptsToken: 'api_key' })).toThrow(/auth_signature_invalid/);
    });
  });
});
