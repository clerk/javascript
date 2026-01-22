// There is no need to execute the complete authenticateRequest to test clerkMiddleware
// This mock SHOULD exist before the import of authenticateRequest
import { AuthStatus, constants, TokenType } from '@clerk/backend/internal';
// used to assert the mock
import assert from 'assert';
import type { NextFetchEvent } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';
import { clerkMiddleware } from '../clerkMiddleware';
import { createRouteMatcher } from '../routeMatcher';
import { decryptClerkRequestData } from '../utils';

vi.mock('../clerkClient');

const publishableKey = 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA';
const authenticateRequestMock = vi.fn().mockResolvedValue({
  toAuth: () => ({
    tokenType: TokenType.SessionToken,
    debug: (d: any) => d,
  }),
  headers: new Headers(),
  publishableKey,
});

/**
 * Disable console warnings about config matchers
 */
const consoleWarn = console.warn;
const consoleLog = console.log;

beforeAll(() => {
  global.console.warn = vi.fn();
  global.console.log = vi.fn();
});
afterAll(() => {
  global.console.warn = consoleWarn;
  global.console.log = consoleLog;
});

beforeEach(() => {
  vi.mocked(clerkClient).mockResolvedValue({
    authenticateRequest: authenticateRequestMock,
    // @ts-expect-error - mock
    telemetry: { record: vi.fn() },
  });
});

// Removing this mock will cause the clerkMiddleware tests to fail due to missing publishable key
// This mock SHOULD exist before the imports
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

describe('ClerkMiddleware type tests', () => {
  // create a copy to test the types only
  // running this function does nothing, it is used purely for type checking
  const clerkMiddlewareMock = vi.fn() as typeof clerkMiddleware;
  it('can receive the appropriate keys', () => {
    clerkMiddlewareMock({ publishableKey: '', secretKey: '' });
    clerkMiddlewareMock({ secretKey: '' });
  });

  it('fails for unknown props', () => {
    // @ts-expect-error - unknown prop
    void clerkMiddlewareMock({ hello: '' });
  });

  it('can be used with a handler and an optional options object', () => {
    clerkMiddlewareMock(
      async (auth, request) => {
        const { getToken } = await auth();
        await getToken();
        request.cookies.clear();
      },
      { secretKey: '', publishableKey: '' },
    );
  });

  it('can be used with just a handler and an optional options object', () => {
    clerkMiddlewareMock(async (auth, request) => {
      const { getToken } = await auth();
      await getToken();
      request.cookies.clear();
    });
  });

  it('can be used with a handler that expects a token type', () => {
    clerkMiddlewareMock(async auth => {
      const { getToken } = await auth({ acceptsToken: TokenType.ApiKey });
      await getToken();
    });
  });

  it('can be used with just an optional options object', () => {
    clerkMiddlewareMock({ secretKey: '', publishableKey: '' });
    clerkMiddlewareMock();
  });

  it('prevents usage of system permissions with auth.has()', () => {
    clerkMiddlewareMock(async (auth, _event, _request) => {
      // @ts-expect-error - system permissions are not allowed
      (await auth()).has({ permission: 'org:sys_foo' });
      // @ts-expect-error - system permissions are not allowed
      await auth.protect(has => has({ permission: 'org:sys_foo' }));
      // @ts-expect-error - system permissions are not allowed
      await auth.protect({ permission: 'org:sys_foo' });
    });
  });

  describe('Multi domain', () => {
    const defaultProps = { publishableKey: '', secretKey: '' };

    it('proxyUrl (primary app)', () => {
      clerkMiddlewareMock({ ...defaultProps, proxyUrl: 'test' });
    });

    it('proxyUrl + isSatellite (satellite app)', () => {
      clerkMiddlewareMock({ ...defaultProps, proxyUrl: 'test', isSatellite: true });
    });

    it('domain + isSatellite (satellite app)', () => {
      clerkMiddlewareMock({ ...defaultProps, domain: 'test', isSatellite: true });
    });
  });
});

describe('createRouteMatcher', () => {
  describe('should work with path patterns', function () {
    it('matches path and all sub paths using *', () => {
      const isPublicRoute = createRouteMatcher(['/hello(.*)']);
      expect(isPublicRoute(mockRequest({ url: '/hello' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/hello' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/hello/test/a' }))).toBe(true);
    });

    it('matches filenames with specific extensions', () => {
      const isPublicRoute = createRouteMatcher(['/(.*).ts', '/(.*).js']);
      expect(isPublicRoute(mockRequest({ url: '/hello.js' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/test/hello.js' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/test/hello.ts' }))).toBe(true);
    });

    it('works with single values (non array)', () => {
      const isPublicRoute = createRouteMatcher('/test/hello.ts');
      expect(isPublicRoute(mockRequest({ url: '/hello.js' }))).not.toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/test/hello.js' }))).not.toBe(true);
    });
  });

  describe('should work with regex patterns', function () {
    it('matches path and all sub paths using *', () => {
      const isPublicRoute = createRouteMatcher([/^\/hello.*$/]);
      expect(isPublicRoute(mockRequest({ url: '/hello' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/hello/' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/hello/test/a' }))).toBe(true);
    });

    it('matches filenames with specific extensions', () => {
      const isPublicRoute = createRouteMatcher([/^.*\.(ts|js)$/]);
      expect(isPublicRoute(mockRequest({ url: '/hello.js' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/test/hello.js' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/test/hello.ts' }))).toBe(true);
    });

    it('works with single values (non array)', () => {
      const isPublicRoute = createRouteMatcher(/hello/g);
      expect(isPublicRoute(mockRequest({ url: '/hello.js' }))).toBe(true);
      expect(isPublicRoute(mockRequest({ url: '/test/hello.js' }))).toBe(true);
    });
  });
});

describe('clerkMiddleware(params)', () => {
  it('renders route as normally when used without params', async () => {
    const signInResp = await clerkMiddleware()(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
    expect(signInResp?.status).toEqual(200);
    expect(signInResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/sign-in');
  });

  it('executes handler and renders route when used with a custom handler', async () => {
    const signInResp = await clerkMiddleware((_, request) => {
      expect(request.url).toContain('/sign-in');
      return NextResponse.next({ headers: { 'a-custom-header': '1' } });
    })(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
    expect(signInResp?.status).toEqual(200);
    expect(signInResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/sign-in');
    expect(signInResp?.headers.get('a-custom-header')).toEqual('1');
  });

  it('renders route when exported directly without being called', async () => {
    // This is equivalent to export default clerkMiddleware;
    const signInResp = await clerkMiddleware(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
    expect(signInResp?.status).toEqual(200);
    expect(signInResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/sign-in');
  });

  it('executes handler and respects any redirects returned by the user', async () => {
    const signInResp = await clerkMiddleware((_, request) => {
      expect(request.url).toContain('/sign-in');
      return NextResponse.redirect('https://www.clerk.com/hello', { headers: { 'a-custom-header': '1' } });
    })(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
    expect(signInResp?.status).toEqual(307);
    expect(signInResp?.headers.get(constants.Headers.Location)).toEqual('https://www.clerk.com/hello');
    expect(signInResp?.headers.get('a-custom-header')).toEqual('1');
  });

  it('propagates middleware dynamic keys to the next request', async () => {
    const options = {
      secretKey: 'sk_test_xxxxxxxxxxxxxxxxxx',
      publishableKey: 'pk_test_xxxxxxxxxxxxx',
      signInUrl: '/foo',
      signUpUrl: '/bar',
    };
    const resp = await clerkMiddleware(options)(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
    expect(resp?.status).toEqual(200);

    const requestData = resp?.headers.get('x-middleware-request-x-clerk-request-data');
    assert.ok(requestData);

    const decryptedData = decryptClerkRequestData(requestData);

    expect(resp?.headers.get('x-middleware-request-x-clerk-request-data')).toBeDefined();
    expect(decryptedData).toEqual(options);
  });

  describe('allows access to request object to define options via callback', () => {
    it('with synchronous callback', async () => {
      const options = {
        secretKey: 'sk_test_xxxxxxxxxxxxxxxxxx',
        publishableKey: 'pk_test_xxxxxxxxxxxxx',
        signInUrl: '/foo',
        signUpUrl: '/bar',
      };
      const resp = await clerkMiddleware(
        () => {
          return NextResponse.next();
        },
        req => ({
          ...options,
          domain: req.nextUrl.host,
        }),
      )(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
      expect(resp?.status).toEqual(200);

      const requestData = resp?.headers.get('x-middleware-request-x-clerk-request-data');
      assert.ok(requestData);

      const decryptedData = decryptClerkRequestData(requestData);

      expect(resp?.headers.get('x-middleware-request-x-clerk-request-data')).toBeDefined();
      expect(decryptedData).toEqual({ ...options, domain: 'www.clerk.com' });
    });

    it('with asynchronous callback', async () => {
      const options = {
        secretKey: 'sk_test_xxxxxxxxxxxxxxxxxx',
        publishableKey: 'pk_test_xxxxxxxxxxxxx',
        signInUrl: '/foo',
        signUpUrl: '/bar',
      };

      const mockFetchOptionsExternalStore = (_req: NextRequest) => Promise.resolve(options);

      const resp = await clerkMiddleware(
        () => {
          return NextResponse.next();
        },
        async req => {
          const resolvedOptions = await mockFetchOptionsExternalStore(req);

          return {
            ...resolvedOptions,
            domain: req.nextUrl.host,
          };
        },
      )(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
      expect(resp?.status).toEqual(200);

      const requestData = resp?.headers.get('x-middleware-request-x-clerk-request-data');
      assert.ok(requestData);

      const decryptedData = decryptClerkRequestData(requestData);

      expect(resp?.headers.get('x-middleware-request-x-clerk-request-data')).toBeDefined();
      expect(decryptedData).toEqual({ ...options, domain: 'www.clerk.com' });
    });
  });

  describe.each([
    {
      name: 'auth().redirectToSignIn()',
      util: 'redirectToSignIn',
      locationHeader: 'sign-in',
    } as const,
    {
      name: 'auth().redirectToSignUp()',
      util: 'redirectToSignUp',
      locationHeader: 'sign-up',
    } as const,
  ])('$name', ({ util, locationHeader }) => {
    it(`redirects to ${locationHeader} url when ${util} is called and the request is a page request`, async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      const resp = await clerkMiddleware(async auth => {
        (await auth())[util]();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain(locationHeader);
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it(`redirects to ${locationHeader} url when redirectToSignIn is called with the correct returnBackUrl`, async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      const resp = await clerkMiddleware(async auth => {
        (await auth())[util]();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(new URL(resp!.headers.get('location')!).searchParams.get('redirect_url')).toContain('/protected');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it(`redirects to ${locationHeader} url with redirect_url set to the provided returnBackUrl param`, async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      const resp = await clerkMiddleware(async auth => {
        (await auth())[util]({ returnBackUrl: 'https://www.clerk.com/hello' });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain(locationHeader);
      expect(new URL(resp!.headers.get('location')!).searchParams.get('redirect_url')).toEqual(
        'https://www.clerk.com/hello',
      );
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it(`redirects to ${locationHeader} url without a redirect_url when returnBackUrl is null`, async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      const resp = await clerkMiddleware(async auth => {
        (await auth())[util]({ returnBackUrl: null });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain(locationHeader);
      expect(new URL(resp!.headers.get('location')!).searchParams.get('redirect_url')).toBeNull();
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });
  });

  describe('auth().redirectToSignUp()', () => {
    it('to support signInOrUp', async () => {
      vi.mocked(clerkClient).mockResolvedValue({
        authenticateRequest: vi.fn().mockResolvedValue({
          toAuth: () => ({
            tokenType: TokenType.SessionToken,
            debug: (d: any) => d,
          }),
          headers: new Headers(),
          publishableKey,
          signInUrl: '/hello',
        }),
        // @ts-expect-error - mock
        telemetry: { record: vi.fn() },
      });

      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      const resp = await clerkMiddleware(async auth => {
        (await auth()).redirectToSignUp();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain(`/hello/create`);
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });
  });

  describe('auth.protect()', () => {
    it('redirects to sign-in url when protect is called, the user is signed out and the request is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain('sign-in');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('does not redirect to sign-in url when protect is called, the user is signed in and the request is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedIn,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: 'user-id' }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('location')).toBeFalsy();
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('does not throw when protect is called and the request is authenticated with a machine token', async () => {
      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: 'Bearer ak_123',
        }),
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedIn,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.ApiKey, id: 'ak_123', isAuthenticated: true }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({ token: TokenType.ApiKey });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('location')).toBeFalsy();
      expect(resp?.headers.get('WWW-Authenticate')).toBeFalsy();
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('throws a not found error when protect is called, the user is signed out, and is not a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers(),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get(constants.Headers.AuthReason)).toContain('protect-rewrite');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('throws an unauthorized error when protect is called and the machine auth token is invalid', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: 'Bearer ak_123',
        }),
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({
          tokenType: TokenType.ApiKey,
          id: null,
        }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({ token: TokenType.ApiKey });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(401);
      expect(resp?.headers.get('WWW-Authenticate')).toBeFalsy();
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('throws an unauthorized error with WWW-Authenticate header when protect is called and the oauth token is invalid', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: 'Bearer oat_123',
        }),
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({
          tokenType: TokenType.OAuthToken,
          id: null,
        }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({ token: TokenType.ApiKey });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(401);
      expect(resp?.headers.get('WWW-Authenticate')).toBe(
        'Bearer resource_metadata="https://clerk.included.katydid-92.lcl.dev/.well-known/oauth-protected-resource"',
      );
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('throws a not found error when protect is called with RBAC params the user does not fulfill, and is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedIn,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: 'user-id', has: () => false }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({ role: 'random-role' });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get(constants.Headers.AuthReason)).toContain('protect-rewrite');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('redirects to unauthenticatedUrl when protect is called with the redirectUrl param, the user is signed out, and is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({ unauthenticatedUrl: 'https://www.clerk.com/hello' });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual('https://www.clerk.com/hello');
      expect(resp?.headers.get(constants.Headers.ClerkRedirectTo)).toEqual('true');
      expect(await (await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('redirects to unauthorizedUrl when protect is called with the redirectUrl param, the user does not fulfill the RBAC params, and is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedIn,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: 'user-id', has: () => false }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect(
          { role: 'random-role' },
          {
            unauthorizedUrl: 'https://www.clerk.com/discover',
            unauthenticatedUrl: 'https://www.clerk.com/hello',
          },
        );
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual('https://www.clerk.com/discover');
      expect(resp?.headers.get(constants.Headers.ClerkRedirectTo)).toEqual('true');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('throws an unauthorized error when protect is called with mismatching token types', async () => {
      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: 'Bearer m2m_123',
        }),
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.M2MToken, id: null }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({ token: TokenType.ApiKey });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(401);
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('does not throw when protect is called with array of token types and request matches one', async () => {
      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: 'Bearer ak_123',
        }),
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedIn,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.ApiKey, id: 'ak_123', isAuthenticated: true }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({ token: [TokenType.SessionToken, TokenType.ApiKey] });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('location')).toBeFalsy();
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('throws a not found error when protect is called with array of token types and request does not match any', async () => {
      const req = mockRequest({
        url: '/api/protected',
        headers: new Headers({
          [constants.Headers.Authorization]: 'Bearer ak_123',
        }),
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.ApiKey, id: null }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({ token: [TokenType.SessionToken, TokenType.M2MToken] });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(401);
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });
  });

  describe('auth().redirectToSignIn()', () => {
    it('redirects to sign-in url even if called without a return statement', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain('sign-in');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('forwards headers from authenticateRequest when auth.protect() is called', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers({
          'Set-Cookie': 'session=;',
          'X-Clerk-Auth': '1',
        }),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('X-Clerk-Auth')).toEqual('1');
      expect(resp?.headers.get('Set-Cookie')).toEqual('session=;');
      expect(resp?.headers.get('location')).toContain('sign-in');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('redirects to unauthenticatedUrl when protect is called with the unauthenticatedUrl param, the user is signed out, and is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect({
          unauthenticatedUrl: 'https://www.clerk.com/unauthenticatedUrl',
          unauthorizedUrl: 'https://www.clerk.com/unauthorizedUrl',
        });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain('https://www.clerk.com/unauthenticatedUrl');
      expect(resp?.headers.get(constants.Headers.ClerkRedirectTo)).toEqual('true');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });

    it('redirects to unauthorizedUrl when protect is called with the unauthorizedUrl param, the user is signed in but does not have permissions, and is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        publishableKey,
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ tokenType: TokenType.SessionToken, userId: 'userId', has: () => false }),
      });

      const resp = await clerkMiddleware(async auth => {
        await auth.protect(
          { permission: 'random-permission' },
          {
            unauthenticatedUrl: 'https://www.clerk.com/unauthenticatedUrl',
            unauthorizedUrl: 'https://www.clerk.com/unauthorizedUrl',
          },
        );
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain('https://www.clerk.com/unauthorizedUrl');
      expect(resp?.headers.get(constants.Headers.ClerkRedirectTo)).toEqual('true');
      expect((await clerkClient()).authenticateRequest).toBeCalled();
    });
  });

  describe('debug', () => {
    beforeEach(() => {
      (global.console.log as ReturnType<typeof vi.fn>).mockClear();
    });

    it('outputs debug logs when used with only params', async () => {
      const signInResp = await clerkMiddleware({ debug: true })(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
      expect(signInResp?.status).toEqual(200);
      // 6 times results from header, footer, options, url, requestState, auth logs
      expect(global.console.log).toBeCalledTimes(6);
    });

    it('outputs debug logs when used with a custom handler', async () => {
      const signInResp = await clerkMiddleware(
        (_, request) => {
          expect(request.url).toContain('/sign-in');
          return NextResponse.next({ headers: { 'a-custom-header': '1' } });
        },
        { debug: true },
      )(mockRequest({ url: '/sign-in' }), {} as NextFetchEvent);
      expect(signInResp?.status).toEqual(200);
      // 6 times results from header, footer, options, url, requestState, auth logs
      expect(global.console.log).toBeCalledTimes(6);
    });
  });
});

describe('Dev Browser JWT when redirecting to cross origin for page requests', function () {
  it('does NOT append the Dev Browser JWT when cookie is missing', async () => {
    const req = mockRequest({
      url: '/protected',
      headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
      appendDevBrowserCookie: false,
    });

    authenticateRequestMock.mockResolvedValueOnce({
      publishableKey,
      status: AuthStatus.SignedOut,
      headers: new Headers(),
      toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
    });

    const resp = await clerkMiddleware(async auth => {
      await auth.protect();
    })(req, {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('location')).toEqual(
      'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
    );
    expect((await clerkClient()).authenticateRequest).toBeCalled();
  });

  it('appends the Dev Browser JWT to the search when cookie __clerk_db_jwt exists and location is an Account Portal URL', async () => {
    const req = mockRequest({
      url: '/protected',
      headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
      appendDevBrowserCookie: true,
    });

    authenticateRequestMock.mockResolvedValueOnce({
      publishableKey,
      status: AuthStatus.SignedOut,
      headers: new Headers(),
      toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
    });

    const resp = await clerkMiddleware(async auth => {
      await auth.protect();
    })(req, {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('location')).toEqual(
      'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected&__clerk_db_jwt=test_jwt',
    );
    expect((await clerkClient()).authenticateRequest).toBeCalled();
  });

  it('does NOT append the Dev Browser JWT if x-clerk-redirect-to header is not set (user-returned redirect)', async () => {
    const req = mockRequest({
      url: '/protected',
      headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
      appendDevBrowserCookie: true,
    });

    authenticateRequestMock.mockResolvedValueOnce({
      publishableKey,
      status: AuthStatus.SignedOut,
      headers: new Headers(),
      toAuth: () => ({ tokenType: TokenType.SessionToken, userId: null }),
    });

    const resp = await clerkMiddleware(() => {
      return NextResponse.redirect(
        'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
      );
    })(req, {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('location')).toEqual(
      'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
    );
    expect((await clerkClient()).authenticateRequest).toBeCalled();
  });
});

describe('frontendApiProxy multi-domain support', () => {
  it('calls proxy when enabled is true and path matches', async () => {
    const req = mockRequest({ url: '/__clerk/v1/client' });

    const resp = await clerkMiddleware({
      frontendApiProxy: { enabled: true },
    })(req, {} as NextFetchEvent);

    // Proxy should intercept the request - we expect a response (not standard middleware response)
    // The proxy returns a response without going through authenticateRequest
    expect((await clerkClient()).authenticateRequest).not.toBeCalled();
    expect(resp).toBeDefined();
  });

  it('does not call proxy when enabled is false', async () => {
    const req = mockRequest({ url: '/__clerk/v1/client' });

    const resp = await clerkMiddleware({
      frontendApiProxy: { enabled: false },
    })(req, {} as NextFetchEvent);

    // Request should pass through to normal auth flow
    expect((await clerkClient()).authenticateRequest).toBeCalled();
    expect(resp?.status).toEqual(200);
  });

  it('calls proxy when enabled function returns true for the request URL', async () => {
    const shouldProxy = vi.fn((url: URL) => url.hostname.endsWith('.replit.app'));
    const req = new NextRequest('https://myapp.replit.app/__clerk/v1/client');

    const resp = await clerkMiddleware({
      frontendApiProxy: {
        enabled: shouldProxy,
      },
    })(req, {} as NextFetchEvent);

    expect(shouldProxy).toHaveBeenCalledWith(expect.any(URL));
    expect(shouldProxy.mock.calls[0]![0].hostname).toBe('myapp.replit.app');
    expect((await clerkClient()).authenticateRequest).not.toBeCalled();
    expect(resp).toBeDefined();
  });

  it('does not call proxy when enabled function returns false for the request URL', async () => {
    const shouldProxy = vi.fn((url: URL) => url.hostname.endsWith('.replit.app'));
    const req = new NextRequest('https://myapp.com/__clerk/v1/client');

    const resp = await clerkMiddleware({
      frontendApiProxy: {
        enabled: shouldProxy,
      },
    })(req, {} as NextFetchEvent);

    expect(shouldProxy).toHaveBeenCalledWith(expect.any(URL));
    expect(shouldProxy.mock.calls[0]![0].hostname).toBe('myapp.com');
    // Request should pass through to normal auth flow
    expect((await clerkClient()).authenticateRequest).toBeCalled();
    expect(resp?.status).toEqual(200);
  });

  it('uses custom path when provided', async () => {
    const req = mockRequest({ url: '/custom-proxy/v1/client' });

    const resp = await clerkMiddleware({
      frontendApiProxy: {
        enabled: true,
        path: '/custom-proxy',
      },
    })(req, {} as NextFetchEvent);

    // Proxy should intercept the request with custom path
    expect((await clerkClient()).authenticateRequest).not.toBeCalled();
    expect(resp).toBeDefined();
  });

  it('does not match default path when custom path is provided', async () => {
    const req = mockRequest({ url: '/__clerk/v1/client' });

    const resp = await clerkMiddleware({
      frontendApiProxy: {
        enabled: true,
        path: '/custom-proxy',
      },
    })(req, {} as NextFetchEvent);

    // Request should pass through to normal auth flow since path doesn't match
    expect((await clerkClient()).authenticateRequest).toBeCalled();
    expect(resp?.status).toEqual(200);
  });

  it('uses default /__clerk path when path is not specified', async () => {
    const req = mockRequest({ url: '/__clerk/v1/client' });

    const resp = await clerkMiddleware({
      frontendApiProxy: { enabled: true },
    })(req, {} as NextFetchEvent);

    // Proxy should intercept the request with default path
    expect((await clerkClient()).authenticateRequest).not.toBeCalled();
    expect(resp).toBeDefined();
  });

  it('correctly filters by multiple domain suffixes', async () => {
    const PROXY_DOMAINS = ['.replit.app', '.replit.dev', '.vercel.app'];
    const shouldProxy = (url: URL) => PROXY_DOMAINS.some(suffix => url.hostname.endsWith(suffix));

    // Test replit.app - should proxy
    const req1 = new NextRequest('https://myapp.replit.app/__clerk/v1/client');
    await clerkMiddleware({ frontendApiProxy: { enabled: shouldProxy } })(req1, {} as NextFetchEvent);
    expect((await clerkClient()).authenticateRequest).not.toBeCalled();

    vi.mocked(clerkClient).mockClear();
    vi.mocked(clerkClient).mockResolvedValue({
      authenticateRequest: authenticateRequestMock,
      // @ts-expect-error - mock
      telemetry: { record: vi.fn() },
    });

    // Test vercel.app - should proxy
    const req2 = new NextRequest('https://myapp.vercel.app/__clerk/v1/client');
    await clerkMiddleware({ frontendApiProxy: { enabled: shouldProxy } })(req2, {} as NextFetchEvent);
    expect((await clerkClient()).authenticateRequest).not.toBeCalled();

    vi.mocked(clerkClient).mockClear();
    vi.mocked(clerkClient).mockResolvedValue({
      authenticateRequest: authenticateRequestMock,
      // @ts-expect-error - mock
      telemetry: { record: vi.fn() },
    });

    // Test custom domain - should not proxy
    const req3 = new NextRequest('https://myapp.com/__clerk/v1/client');
    await clerkMiddleware({ frontendApiProxy: { enabled: shouldProxy } })(req3, {} as NextFetchEvent);
    expect((await clerkClient()).authenticateRequest).toBeCalled();
  });

  it('supports proxy everywhere except production pattern', async () => {
    const shouldProxy = (url: URL) => {
      // Don't proxy on production domain
      if (url.hostname === 'myapp.com' || url.hostname === 'www.myapp.com') {
        return false;
      }
      // Proxy everywhere else (staging, preview, dev)
      return true;
    };

    // Test production - should not proxy
    const req1 = new NextRequest('https://myapp.com/__clerk/v1/client');
    await clerkMiddleware({ frontendApiProxy: { enabled: shouldProxy } })(req1, {} as NextFetchEvent);
    expect((await clerkClient()).authenticateRequest).toBeCalled();

    vi.mocked(clerkClient).mockClear();
    vi.mocked(clerkClient).mockResolvedValue({
      authenticateRequest: authenticateRequestMock,
      // @ts-expect-error - mock
      telemetry: { record: vi.fn() },
    });

    // Test staging - should proxy
    const req2 = new NextRequest('https://staging.myapp.com/__clerk/v1/client');
    await clerkMiddleware({ frontendApiProxy: { enabled: shouldProxy } })(req2, {} as NextFetchEvent);
    expect((await clerkClient()).authenticateRequest).not.toBeCalled();
  });

  it('auto-derives proxyUrl from frontendApiProxy config for handshake redirects', async () => {
    // Request to a non-proxy path should go through auth with derived proxyUrl
    const req = new NextRequest('https://myapp.example.com/dashboard');

    await clerkMiddleware({
      frontendApiProxy: { enabled: true, path: '/__clerk' },
    })(req, {} as NextFetchEvent);

    // authenticateRequest should be called with the derived proxyUrl
    expect((await clerkClient()).authenticateRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        proxyUrl: 'https://myapp.example.com/__clerk',
      }),
    );
  });

  it('auto-derives proxyUrl with custom proxy path', async () => {
    const req = new NextRequest('https://myapp.example.com/dashboard');

    await clerkMiddleware({
      frontendApiProxy: { enabled: true, path: '/custom-clerk-proxy' },
    })(req, {} as NextFetchEvent);

    expect((await clerkClient()).authenticateRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        proxyUrl: 'https://myapp.example.com/custom-clerk-proxy',
      }),
    );
  });

  it('does not derive proxyUrl when frontendApiProxy is not configured', async () => {
    const req = new NextRequest('https://myapp.example.com/dashboard');

    await clerkMiddleware()(req, {} as NextFetchEvent);

    // authenticateRequest should be called without proxyUrl
    expect((await clerkClient()).authenticateRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.not.objectContaining({
        proxyUrl: expect.any(String),
      }),
    );
  });

  it('does not override explicit proxyUrl option', async () => {
    const req = new NextRequest('https://myapp.example.com/dashboard');

    await clerkMiddleware({
      frontendApiProxy: { enabled: true, path: '/__clerk' },
      proxyUrl: 'https://custom-proxy.example.com/__clerk',
    })(req, {} as NextFetchEvent);

    // Should use the explicit proxyUrl, not the derived one
    expect((await clerkClient()).authenticateRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        proxyUrl: 'https://custom-proxy.example.com/__clerk',
      }),
    );
  });
});
