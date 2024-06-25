// There is no need to execute the complete authenticateRequest to test authMiddleware
// This mock SHOULD exist before the import of authenticateRequest
import { AuthStatus } from '@clerk/backend/internal';
import { expectTypeOf } from 'expect-type';
import type { NextFetchEvent } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';

const authenticateRequestMock = jest.fn().mockResolvedValue({
  toAuth: () => ({}),
  headers: new Headers(),
});

// Removing this mock will cause the authMiddleware tests to fail due to missing publishable key
// This mock SHOULD exist before the imports
jest.mock('../constants', () => {
  return {
    PUBLISHABLE_KEY: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    SECRET_KEY: 'sk_test_xxxxxxxxxxxxxxxxxx',
    ENCRYPTION_KEY: 'encryption-key',
  };
});

jest.mock('../clerkClient', () => {
  return {
    clerkClient: {
      authenticateRequest: authenticateRequestMock,
      telemetry: { record: jest.fn() },
    },
  };
});

import { paths } from '../../utils';
import { authMiddleware, DEFAULT_CONFIG_MATCHER, DEFAULT_IGNORED_ROUTES } from '../authMiddleware';
// used to assert the mock
import { clerkClient } from '../clerkClient';
import { createRouteMatcher } from '../routeMatcher';

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

type MockRequestParams = {
  url: string;
  appendDevBrowserCookie?: boolean;
  method?: string;
  headers?: any;
};

const mockRequest = ({
  url,
  appendDevBrowserCookie = false,
  method = 'GET',
  headers = new Headers(),
}: MockRequestParams) => {
  const headersWithCookie = new Headers(headers);
  if (appendDevBrowserCookie) {
    headersWithCookie.append('cookie', '__clerk_db_jwt=test_jwt');
  }
  return new NextRequest(new URL(url, 'https://www.clerk.com').toString(), {
    method,
    headers: headersWithCookie,
  });
};

describe('isPublicRoute', () => {
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

const validRoutes = [
  '/api',
  '/api/',
  '/api/hello',
  '/trpc',
  '/trpc/hello',
  '/trpc/hello.example',
  '/protected',
  '/protected/',
  '/protected/hello',
  '/protected/hello.example/hello',
  '/my-protected-page',
  '/my/$special/$pages',
];

const invalidRoutes = [
  '/_next',
  '/favicon.ico',
  '/_next/test.json',
  '/files/api.pdf',
  '/test/api/test.pdf',
  '/imgs/img.png',
  '/imgs/img-dash.jpg',
];

describe('default config matcher', () => {
  it('compiles to regex using path-to-regex', () => {
    [DEFAULT_CONFIG_MATCHER].flat().forEach(path => {
      expect(paths.toRegexp(path)).toBeInstanceOf(RegExp);
    });
  });

  describe('does not match any static files or next internals', function () {
    it.each(invalidRoutes)(`does not match %s`, path => {
      const matcher = createRouteMatcher(DEFAULT_CONFIG_MATCHER);
      expect(matcher(mockRequest({ url: path }))).toBe(false);
    });
  });

  describe('matches /api or known framework routes', function () {
    it.each(validRoutes)(`matches %s`, path => {
      const matcher = createRouteMatcher(DEFAULT_CONFIG_MATCHER);
      expect(matcher(mockRequest({ url: path }))).toBe(true);
    });
  });
});

describe('default ignored routes matcher', () => {
  it('compiles to regex using path-to-regex', () => {
    [DEFAULT_IGNORED_ROUTES].flat().forEach(path => {
      expect(paths.toRegexp(path)).toBeInstanceOf(RegExp);
    });
  });

  describe('matches all static files or next internals', function () {
    it.each(invalidRoutes)(`matches %s`, path => {
      const matcher = createRouteMatcher(DEFAULT_IGNORED_ROUTES);
      expect(matcher(mockRequest({ url: path }))).toBe(true);
    });
  });

  describe('does not match /api or known framework routes', function () {
    it.each(validRoutes)(`does not match %s`, path => {
      const matcher = createRouteMatcher(DEFAULT_IGNORED_ROUTES);
      expect(matcher(mockRequest({ url: path }))).toBe(false);
    });
  });
});

describe('authMiddleware(params)', () => {
  beforeEach(() => {
    authenticateRequestMock.mockClear();
  });

  describe('without params', function () {
    it('redirects to sign-in for protected route', async () => {
      const resp = await authMiddleware()(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual(
        'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
      );
    });

    it('renders public route', async () => {
      const signInResp = await authMiddleware({ publicRoutes: '/sign-in' })(
        mockRequest({ url: '/sign-in' }),
        {} as NextFetchEvent,
      );
      expect(signInResp?.status).toEqual(200);
      expect(signInResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/sign-in');

      const signUpResp = await authMiddleware({ publicRoutes: ['/sign-up'] })(
        mockRequest({ url: '/sign-up' }),
        {} as NextFetchEvent,
      );
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
      })(mockRequest({ url: '/ignored' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(clerkClient().authenticateRequest).not.toBeCalled();
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
      })(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(clerkClient().authenticateRequest).toBeCalled();
      expect(beforeAuthSpy).toBeCalled();
      expect(afterAuthSpy).toBeCalled();
    });
  });

  describe('with publicRoutes', function () {
    it('renders public route', async () => {
      const resp = await authMiddleware({
        publicRoutes: '/public',
      })(mockRequest({ url: '/public' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/public');
    });

    describe('when sign-in/sign-up routes are defined in env', () => {
      const currentSignInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
      const currentSignUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;

      beforeEach(() => {
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = '/custom-sign-in';
        process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = '/custom-sign-up';
      });

      afterEach(() => {
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = currentSignInUrl;
        process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = currentSignUpUrl;
      });

      it('renders sign-in/sign-up routes', async () => {
        const signInResp = await authMiddleware({
          publicRoutes: '/public',
        })(mockRequest({ url: '/custom-sign-in' }), {} as NextFetchEvent);
        expect(signInResp?.status).toEqual(200);
        expect(signInResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/custom-sign-in');

        const signUpResp = await authMiddleware({
          publicRoutes: '/public',
        })(mockRequest({ url: '/custom-sign-up' }), {} as NextFetchEvent);
        expect(signUpResp?.status).toEqual(200);
        expect(signUpResp?.headers.get('x-middleware-rewrite')).toEqual('https://www.clerk.com/custom-sign-up');
      });
    });

    it('redirects to sign-in for protected route', async () => {
      const resp = await authMiddleware({
        publicRoutes: '/public',
      })(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

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
      })(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('x-clerk-auth-reason')).toEqual('skip');
      expect(clerkClient().authenticateRequest).not.toBeCalled();
      expect(afterAuthSpy).not.toBeCalled();
    });

    it('executes auth middleware execution when beforeAuth returns undefined', async () => {
      const afterAuthSpy = jest.fn();
      const resp = await authMiddleware({
        beforeAuth: () => undefined,
        afterAuth: afterAuthSpy,
      })(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(clerkClient().authenticateRequest).toBeCalled();
      expect(afterAuthSpy).toBeCalled();
    });

    it('skips auth middleware execution when beforeAuth returns NextResponse.redirect', async () => {
      const afterAuthSpy = jest.fn();
      const resp = await authMiddleware({
        beforeAuth: () => NextResponse.redirect('https://www.clerk.com/custom-redirect'),
        afterAuth: afterAuthSpy,
      })(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual('https://www.clerk.com/custom-redirect');
      expect(clerkClient().authenticateRequest).not.toBeCalled();
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
      })(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(200);
      expect(resp?.headers.get('x-before-auth-header')).toEqual('before');
      expect(resp?.headers.get('x-after-auth-header')).toEqual('after');
      expect(clerkClient().authenticateRequest).toBeCalled();
    });
  });

  describe('with afterAuth', function () {
    it('redirects to sign-in for protected route and sets redirect as auth reason header', async () => {
      const resp = await authMiddleware({
        beforeAuth: () => NextResponse.next(),
      })(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('location')).toEqual(
        'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
      );
      expect(clerkClient().authenticateRequest).toBeCalled();
    });

    it('uses authenticateRequest result as auth', async () => {
      const req = mockRequest({ url: '/protected' });
      const event = {} as NextFetchEvent;
      authenticateRequestMock.mockResolvedValueOnce({ toAuth: () => ({ userId: null }), headers: new Headers() });
      const afterAuthSpy = jest.fn();

      await authMiddleware({ afterAuth: afterAuthSpy })(req, event);

      expect(clerkClient().authenticateRequest).toBeCalled();
      expect(afterAuthSpy).toBeCalledWith(
        {
          userId: null,
          isPublicRoute: false,
          isApiRoute: false,
        },
        req,
        event,
      );
    });
  });

  describe('authenticateRequest', function () {
    it('returns 307 and starts the handshake flow for handshake requestState status', async () => {
      const mockLocationUrl = 'https://example.com';
      authenticateRequestMock.mockResolvedValueOnce({
        status: AuthStatus.Handshake,
        headers: new Headers({ Location: mockLocationUrl }),
      });
      const resp = await authMiddleware()(mockRequest({ url: '/protected' }), {} as NextFetchEvent);

      expect(resp?.status).toEqual(307);
      expect(resp?.headers.get('Location')).toEqual(mockLocationUrl);
    });
  });
});

describe('Dev Browser JWT when redirecting to cross origin', function () {
  it('does NOT append the Dev Browser JWT when cookie is missing', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
    })(mockRequest({ url: '/protected', appendDevBrowserCookie: false }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('location')).toEqual(
      'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected',
    );
    expect(clerkClient().authenticateRequest).toBeCalled();
  });

  it('appends the Dev Browser JWT to the search when cookie __clerk_db_jwt exists and location is an Account Portal URL', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
    })(mockRequest({ url: '/protected', appendDevBrowserCookie: true }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('location')).toEqual(
      'https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=https%3A%2F%2Fwww.clerk.com%2Fprotected&__clerk_db_jwt=test_jwt',
    );
    expect(clerkClient().authenticateRequest).toBeCalled();
  });

  it('does NOT append the Dev Browser JWT if x-clerk-redirect-to header is not set', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.redirect('https://google.com/'),
    })(mockRequest({ url: '/protected', appendDevBrowserCookie: true }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('location')).toEqual('https://google.com/');
    expect(clerkClient().authenticateRequest).toBeCalled();
  });
});

describe('isApiRoute', function () {
  it('treats route as API route if apiRoutes match the route path', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
      apiRoutes: ['/api/(.*)'],
    })(mockRequest({ url: '/api/items' }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(401);
    expect(resp?.headers.get('content-type')).toEqual('application/json');
  });

  it('treats route as Page route if apiRoutes do not match the route path', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
      apiRoutes: ['/api/(.*)'],
    })(mockRequest({ url: '/page' }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
  });

  it('treats route as API route if apiRoutes prop is missing and route path matches the default matcher (/api/(.*))', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
    })(mockRequest({ url: '/api/items' }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(401);
    expect(resp?.headers.get('content-type')).toEqual('application/json');
  });

  it('treats route as API route if apiRoutes prop is missing and route path matches the default matcher (/trpc/(.*))', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
    })(mockRequest({ url: '/trpc/items' }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(401);
    expect(resp?.headers.get('content-type')).toEqual('application/json');
  });

  it('treats route as API route if apiRoutes prop is missing and Request method is not-GET,OPTIONS,HEAD', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
    })(mockRequest({ url: '/products/items', method: 'POST' }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(401);
    expect(resp?.headers.get('content-type')).toEqual('application/json');
  });

  it('treats route as API route if apiRoutes prop is missing and Request headers Content-Type is application/json', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
    })(
      mockRequest({ url: '/products/items', headers: new Headers({ 'content-type': 'application/json' }) }),
      {} as NextFetchEvent,
    );

    expect(resp?.status).toEqual(401);
    expect(resp?.headers.get('content-type')).toEqual('application/json');
  });
});

describe('401 Response on Api Routes', function () {
  it('returns 401 when route is not public and route matches API routes', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
      apiRoutes: ['/products/(.*)'],
    })(mockRequest({ url: '/products/items' }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(401);
    expect(resp?.headers.get('content-type')).toEqual('application/json');
  });

  it('returns 307 when route is not public and route does not match API routes', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
      apiRoutes: ['/products/(.*)'],
    })(mockRequest({ url: '/api/items' }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(307);
    expect(resp?.headers.get('content-type')).not.toEqual('application/json');
  });

  it('returns 200 when API route is public', async () => {
    const resp = await authMiddleware({
      beforeAuth: () => NextResponse.next(),
      publicRoutes: ['/public'],
      apiRoutes: ['/public'],
    })(mockRequest({ url: '/public' }), {} as NextFetchEvent);

    expect(resp?.status).toEqual(200);
  });
});

describe('Type tests', () => {
  type AuthMiddleware = Parameters<typeof authMiddleware>[0];
  describe('AuthMiddleware', () => {
    it('is the options argument for authMiddleware', () => {
      () => {
        authMiddleware({} as AuthMiddleware);
      };
    });

    it('can receive the appropriate keys', () => {
      expectTypeOf({ publishableKey: '', secretKey: '' }).toMatchTypeOf<AuthMiddleware>();
      expectTypeOf({ secretKey: '' }).toMatchTypeOf<AuthMiddleware>();
      expectTypeOf({ publishableKey: '', secretKey: '' }).toMatchTypeOf<AuthMiddleware>();
      expectTypeOf({ secretKey: '' }).toMatchTypeOf<AuthMiddleware>();
    });

    describe('Multi domain', () => {
      const defaultProps = { publishableKey: '', secretKey: '' };

      it('proxyUrl (primary app)', () => {
        expectTypeOf({ ...defaultProps, proxyUrl: 'test' }).toMatchTypeOf<AuthMiddleware>();
      });

      it('proxyUrl + isSatellite (satellite app)', () => {
        expectTypeOf({ ...defaultProps, proxyUrl: 'test', isSatellite: true }).toMatchTypeOf<AuthMiddleware>();
      });

      it('domain + isSatellite (satellite app)', () => {
        expectTypeOf({ ...defaultProps, domain: 'test', isSatellite: true }).toMatchTypeOf<AuthMiddleware>();
      });
    });
  });
});
