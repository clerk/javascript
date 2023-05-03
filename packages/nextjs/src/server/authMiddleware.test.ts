// There is no need to execute the complete authenticateRequest to test authMiddleware
// This mock SHOULD exist before the import of authenticateRequest
jest.mock('./authenticateRequest', () => {
  const { handleInterstitialState, handleUnknownState } = jest.requireActual('./authenticateRequest');
  return {
    authenticateRequest: jest.fn().mockResolvedValue({
      toAuth: () => ({}),
    }),
    handleInterstitialState,
    handleUnknownState,
  };
});

// Removing this mock will cause the authMiddleware tests to fail due to missing publishable key
// This mock SHOULD exist before the imports
jest.mock('./clerkClient', () => {
  const { debugRequestState } = jest.requireActual('./clerkClient');
  return {
    PUBLISHABLE_KEY: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    clerkClient: {
      localInterstitial: jest.fn().mockResolvedValue('<html>interstitial</html>'),
    },
    debugRequestState,
  };
});

import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { paths } from '../utils';
// used to assert the mock
import { authenticateRequest } from './authenticateRequest';
import { authMiddleware, createRouteMatcher, DEFAULT_CONFIG_MATCHER, DEFAULT_IGNORED_ROUTES } from './authMiddleware';
// used to assert the mock
import { clerkClient } from './clerkClient';

const mockRequest = (url: string) => {
  return {
    url: new URL(url, 'https://www.clerk.com').toString(),
    nextUrl: new URL(url, 'https://www.clerk.com'),
    cookies: {},
    headers: new Headers(),
  } as NextRequest;
};

describe('isPublicRoute', () => {
  describe('should work with path patterns', function () {
    it('matches path and all sub paths using *', () => {
      const isPublicRoute = createRouteMatcher(['/hello(.*)']);
      expect(isPublicRoute(mockRequest('/hello'))).toBe(true);
      expect(isPublicRoute(mockRequest('/hello/'))).toBe(true);
      expect(isPublicRoute(mockRequest('/hello/test/a'))).toBe(true);
    });

    it('matches filenames with specific extensions', () => {
      const isPublicRoute = createRouteMatcher(['/(.*).ts', '/(.*).js']);
      expect(isPublicRoute(mockRequest('/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.ts'))).toBe(true);
    });

    it('works with single values (non array)', () => {
      const isPublicRoute = createRouteMatcher('/test/hello.ts');
      expect(isPublicRoute(mockRequest('/hello.js'))).not.toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.js'))).not.toBe(true);
    });
  });

  describe('should work with regex patterns', function () {
    it('matches path and all sub paths using *', () => {
      const isPublicRoute = createRouteMatcher([/^\/hello.*$/]);
      expect(isPublicRoute(mockRequest('/hello'))).toBe(true);
      expect(isPublicRoute(mockRequest('/hello/'))).toBe(true);
      expect(isPublicRoute(mockRequest('/hello/test/a'))).toBe(true);
    });

    it('matches filenames with specific extensions', () => {
      const isPublicRoute = createRouteMatcher([/^.*\.(ts|js)$/]);
      expect(isPublicRoute(mockRequest('/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.ts'))).toBe(true);
    });

    it('works with single values (non array)', () => {
      const isPublicRoute = createRouteMatcher(/hello/g);
      expect(isPublicRoute(mockRequest('/hello.js'))).toBe(true);
      expect(isPublicRoute(mockRequest('/test/hello.js'))).toBe(true);
    });
  });
});

describe('default matcher', () => {
  it('compiles to regex using path-to-regex', () => {
    [DEFAULT_CONFIG_MATCHER, DEFAULT_IGNORED_ROUTES].flat().forEach(path => {
      expect(paths.toRegexp(path)).toBeInstanceOf(RegExp);
    });
  });

  it('does not match any static files or next internals', () => {
    const matcher = createRouteMatcher(DEFAULT_CONFIG_MATCHER);
    expect(matcher(mockRequest('/_next'))).toBe(false);
    expect(matcher(mockRequest('/favicon.ico'))).toBe(false);
    expect(matcher(mockRequest('/_next/test.json'))).toBe(false);
  });

  it('ignores the files matched by ignoredRoutes', () => {
    const matcher = createRouteMatcher(DEFAULT_IGNORED_ROUTES);
    expect(matcher(mockRequest('/_next'))).toBe(true);
    expect(matcher(mockRequest('/favicon.ico'))).toBe(true);
    expect(matcher(mockRequest('/_next/test.json'))).toBe(true);
  });
});

describe('authMiddleware(params)', () => {
  beforeEach(() => {
    // @ts-ignore
    authenticateRequest.mockClear();
    // @ts-ignore
    clerkClient.localInterstitial.mockClear();
  });

  describe('without params', function () {
    it('redirects to sign-in for protected route', async () => {
      const resp = await authMiddleware()(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual(
        'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
      );
    });

    it('renders public route', async () => {
      const signInResp = await authMiddleware()(mockRequest('/sign-in'), {} as NextFetchEvent);
      expect(signInResp?.status).toEqual(200);
      expect(signInResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/sign-in');

      const signUpResp = await authMiddleware()(mockRequest('/sign-up'), {} as NextFetchEvent);
      expect(signUpResp?.status).toEqual(200);
      expect(signUpResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/sign-up');
    });
  });

  describe('with ignoredRoutes', function () {
    it('skips auth middleware execution', async () => {
      const beforeAuthSpy = jest.fn();
      const afterAuthSpy = jest.fn();
      const resp = await authMiddleware({
        ignoredRoutes: '/ignored',
        beforeAuth: beforeAuthSpy,
        afterAuth: afterAuthSpy,
      })(mockRequest('/ignored'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(authenticateRequest).not.toBeCalled();
      expect(beforeAuthSpy).not.toBeCalled();
      expect(afterAuthSpy).not.toBeCalled();
    });

    it('executes auth middleware execution when is not matched', async () => {
      const beforeAuthSpy = jest.fn();
      const afterAuthSpy = jest.fn();
      const resp = await authMiddleware({
        ignoredRoutes: '/ignored',
        beforeAuth: beforeAuthSpy,
        afterAuth: afterAuthSpy,
      })(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(authenticateRequest).toBeCalled();
      expect(beforeAuthSpy).toBeCalled();
      expect(afterAuthSpy).toBeCalled();
    });
  });

  describe('with publicRoutes', function () {
    it('renders public route', async () => {
      const resp = await authMiddleware({
        publicRoutes: '/public',
      })(mockRequest('/public'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/public');
    });

    it('renders sign-in/sing-up routes', async () => {
      const signInResp = await authMiddleware({
        publicRoutes: '/public',
      })(mockRequest('/sign-in'), {} as NextFetchEvent);
      expect(signInResp?.status).toEqual(200);
      expect(signInResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/sign-in');

      const signUpResp = await authMiddleware({
        publicRoutes: '/public',
      })(mockRequest('/sign-up'), {} as NextFetchEvent);
      expect(signUpResp?.status).toEqual(200);
      expect(signUpResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/sign-up');
    });

    it('redirects to sign-in for protected route', async () => {
      const resp = await authMiddleware({
        publicRoutes: '/public',
      })(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual(
        'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
      );
    });
  });

  describe('with beforeAuth', function () {
    it('skips auth middleware execution when beforeAuth returns false', async () => {
      const afterAuthSpy = jest.fn();
      const resp = await authMiddleware({
        beforeAuth: () => false,
        afterAuth: afterAuthSpy,
      })(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('skip');
      expect(authenticateRequest).not.toBeCalled();
      expect(afterAuthSpy).not.toBeCalled();
    });

    it('executes auth middleware execution when beforeAuth returns undefined', async () => {
      const afterAuthSpy = jest.fn();
      const resp = await authMiddleware({
        beforeAuth: () => undefined,
        afterAuth: afterAuthSpy,
      })(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(authenticateRequest).toBeCalled();
      expect(afterAuthSpy).toBeCalled();
    });

    it('skips auth middleware execution when beforeAuth returns NextResponse.redirect', async () => {
      const afterAuthSpy = jest.fn();
      const resp = await authMiddleware({
        beforeAuth: () => NextResponse.redirect('https://www.clerk.com/custom-redirect'),
        afterAuth: afterAuthSpy,
      })(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual('https://www.clerk.com/custom-redirect');
      expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
      expect(authenticateRequest).not.toBeCalled();
      expect(afterAuthSpy).not.toBeCalled();
    });

    it('executes auth middleware when beforeAuth returns NextResponse', async () => {
      const resp = await authMiddleware({
        beforeAuth: () =>
          NextResponse.next({
            headers: {
              'x-before-auth-header': 'before',
            },
          }),
        afterAuth: () =>
          NextResponse.next({
            headers: {
              'x-after-auth-header': 'after',
            },
          }),
      })(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('x-before-auth-header')).toEqual('before');
      expect(resp?.headers.get('x-after-auth-header')).toEqual('after');
      expect(authenticateRequest).toBeCalled();
    });
  });

  describe('with afterAuth', function () {
    it('redirects to sign-in for protected route and sets redirect as auth reason header', async () => {
      const resp = await authMiddleware({
        beforeAuth: () => NextResponse.next(),
      })(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual(
        'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
      );
      expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('redirect');
      expect(authenticateRequest).toBeCalled();
    });

    it('uses authenticateRequest result as auth', async () => {
      const req = mockRequest('/protected');
      const event = {} as NextFetchEvent;
      // @ts-ignore
      authenticateRequest.mockResolvedValueOnce({ toAuth: () => ({ userId: null }) });
      const afterAuthSpy = jest.fn();

      await authMiddleware({ afterAuth: afterAuthSpy })(req, event);

      expect(authenticateRequest).toBeCalled();
      expect(afterAuthSpy).toBeCalledWith(
        {
          userId: null,
          isPublicRoute: false,
        },
        req,
        event,
      );
    });
  });

  describe('authenticateRequest', function () {
    it('returns 401 with local interstitial for interstitial requestState', async () => {
      // @ts-ignore
      authenticateRequest.mockResolvedValueOnce({ isInterstitial: true });
      const resp = await authMiddleware()(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(401);
      expect(resp?.headers.get('content-type')).toEqual('text/html');
      expect(clerkClient.localInterstitial).toBeCalled();
    });

    it('returns 401 for unknown requestState', async () => {
      // @ts-ignore
      authenticateRequest.mockResolvedValueOnce({ isUnknown: true });
      const resp = await authMiddleware()(mockRequest('/protected'), {} as NextFetchEvent);

      expect(resp?.status).toEqual(401);
      expect(resp?.body).toBeNull();
      expect(resp?.headers.get('content-type')).toEqual('text/html');
      expect(clerkClient.localInterstitial).not.toBeCalled();
    });
  });
});
