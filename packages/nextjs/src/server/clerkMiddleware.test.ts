// There is no need to execute the complete authenticateRequest to test authMiddleware
// This mock SHOULD exist before the import of authenticateRequest
import { AuthStatus, constants } from '@clerk/backend/internal';
import { describe, expect } from '@jest/globals';
import type { NextFetchEvent } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';

const authenticateRequestMock = jest.fn().mockResolvedValue({
  toAuth: () => ({}),
  headers: new Headers(),
});

jest.mock('./clerkClient', () => {
  return {
    clerkClient: {
      authenticateRequest: authenticateRequestMock,
      telemetry: { record: jest.fn() },
    },
  };
});

// used to assert the mock
import { clerkClient } from './clerkClient';
import { clerkMiddleware } from './clerkMiddleware';
import { createRouteMatcher } from './routeMatcher';

/**
 * Disable console warnings about config matchers
 */
const consoleWarn = console.warn;
global.console.warn = jest.fn();
beforeAll(() => {
  global.console.warn = jest.fn();
});
afterAll(() => {
  global.console.warn = consoleWarn;
});

// Removing this mock will cause the authMiddleware tests to fail due to missing publishable key
// This mock SHOULD exist before the imports
jest.mock('./constants', () => {
  return {
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
  const clerkMiddlewareMock = jest.fn() as typeof clerkMiddleware;
  it('can receive the appropriate keys', () => {
    clerkMiddlewareMock({ publishableKey: '', secretKey: '' });
    clerkMiddlewareMock({ secretKey: '' });
  });

  it('fails for unknown props', () => {
    // @ts-expect-error - unknown prop
    clerkMiddlewareMock({ hello: '' });
  });

  it('can be used with a handler and an optional options object', () => {
    clerkMiddlewareMock(
      (auth, request, event) => {
        auth().getToken();
        request.cookies.clear();
        event.sourcePage;
      },
      { secretKey: '', publishableKey: '' },
    );
  });

  it('can be used with just a handler and an optional options object', () => {
    clerkMiddlewareMock((auth, request, event) => {
      auth().getToken();
      request.cookies.clear();
      event.sourcePage;
    });
  });

  it('can be used with just an optional options object', () => {
    clerkMiddlewareMock({ secretKey: '', publishableKey: '' });
    clerkMiddlewareMock();
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

describe('authenticateRequest & handshake', () => {
  beforeEach(() => {
    authenticateRequestMock.mockClear();
  });

  it('returns 307 and starts the handshake flow for handshake requestState status', async () => {
    const mockLocationUrl = 'https://example.com';
    authenticateRequestMock.mockResolvedValueOnce({
      status: AuthStatus.Handshake,
      headers: new Headers({ Location: mockLocationUrl }),
    });
    const resp = await clerkMiddleware()(mockRequest({ url: '/protected' }), {} as NextFetchEvent);
    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('Location')).toEqual(mockLocationUrl);
  });
});

describe('authMiddleware(params)', () => {
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

  it('renders route when when exported directly without being called', async () => {
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
    expect(signInResp?.headers.get(constants.Headers.AuthReason)).toBeTruthy();
  });

  describe('auth().redirectToSignIn()', () => {
    it('redirects to sign-in url when redirectToSignIn is calle and the request is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ userId: null }),
      });

      const resp = await clerkMiddleware(auth => {
        return auth().redirectToSignIn();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain('sign-in');
      expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
      expect(clerkClient.authenticateRequest).toBeCalled();
    });

    it('redirects to sign-in url when redirectToSignIn is calle and the request is not a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers(),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ userId: null }),
      });

      const resp = await clerkMiddleware(auth => {
        return auth().redirectToSignIn();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain('sign-in');
      expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
      expect(clerkClient.authenticateRequest).toBeCalled();
    });
  });

  describe('auth().protect()', () => {
    it('redirects to sign-in url when protect is called, the user is signed out and the request is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ userId: null }),
      });

      const resp = await clerkMiddleware(auth => {
        auth().protect();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain('sign-in');
      expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
      expect(clerkClient.authenticateRequest).toBeCalled();
    });

    it('does not redirect to sign-in url when protect is called, the user is signed in and the request is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        status: AuthStatus.SignedIn,
        headers: new Headers(),
        toAuth: () => ({ userId: 'user-id' }),
      });

      const resp = await clerkMiddleware(auth => {
        auth().protect();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('location')).toBeFalsy();
      expect(clerkClient.authenticateRequest).toBeCalled();
    });

    it('throws a not found error when protect is called, the user is signed out, and is not a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers(),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ userId: null }),
      });

      const resp = await clerkMiddleware(auth => {
        auth().protect();
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get(constants.Headers.AuthReason)).toContain('protect-rewrite');
      expect(clerkClient.authenticateRequest).toBeCalled();
    });

    it('throws a not found error when protect is called with RBAC params the user does not fulfil, and is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        status: AuthStatus.SignedIn,
        headers: new Headers(),
        toAuth: () => ({ userId: 'user-id', has: () => false }),
      });

      const resp = await clerkMiddleware(auth => {
        auth().protect({ role: 'random-role' });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get(constants.Headers.AuthReason)).toContain('protect-rewrite');
      expect(clerkClient.authenticateRequest).toBeCalled();
    });

    it('redirects to redirectUrl when protect is called with the redirectUrl param, the user is signed out, and is a page request', async () => {
      const req = mockRequest({
        url: '/protected',
        headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
        appendDevBrowserCookie: true,
      });

      authenticateRequestMock.mockResolvedValueOnce({
        status: AuthStatus.SignedOut,
        headers: new Headers(),
        toAuth: () => ({ userId: null }),
      });

      const resp = await clerkMiddleware(auth => {
        auth().protect({ redirectUrl: 'https://www.clerk.com/hello' });
      })(req, {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toContain('https://www.clerk.com/hello');
      expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
      expect(resp?.headers.get(constants.Headers.ClerkRedirectTo)).toEqual('true');
      expect(clerkClient.authenticateRequest).toBeCalled();
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
      status: AuthStatus.SignedOut,
      headers: new Headers(),
      toAuth: () => ({ userId: null }),
    });

    const resp = await clerkMiddleware(auth => {
      auth().protect();
    })(req, {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('location')).toEqual(
      'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
    );
    expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
    expect(clerkClient.authenticateRequest).toBeCalled();
  });

  it('appends the Dev Browser JWT to the search when cookie __clerk_db_jwt exists and location is an Account Portal URL', async () => {
    const req = mockRequest({
      url: '/protected',
      headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
      appendDevBrowserCookie: true,
    });

    authenticateRequestMock.mockResolvedValueOnce({
      status: AuthStatus.SignedOut,
      headers: new Headers(),
      toAuth: () => ({ userId: null }),
    });

    const resp = await clerkMiddleware(auth => {
      auth().protect();
    })(req, {} as NextFetchEvent);
    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('location')).toEqual(
      'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected&__clerk_db_jwt=test_jwt',
    );
    expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
    expect(clerkClient.authenticateRequest).toBeCalled();
  });

  it('does NOT append the Dev Browser JWT if x-clerk-redirect-to header is not set (user-returned redirect)', async () => {
    const req = mockRequest({
      url: '/protected',
      headers: new Headers({ [constants.Headers.SecFetchDest]: 'document' }),
      appendDevBrowserCookie: true,
    });

    authenticateRequestMock.mockResolvedValueOnce({
      status: AuthStatus.SignedOut,
      headers: new Headers(),
      toAuth: () => ({ userId: null }),
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
    expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
    expect(clerkClient.authenticateRequest).toBeCalled();
  });
});
