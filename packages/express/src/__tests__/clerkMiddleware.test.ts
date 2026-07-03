import type * as ClerkBackend from '@clerk/backend';
import type { Request, RequestHandler, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockClerkFrontendApiProxy } = vi.hoisted(() => ({
  mockClerkFrontendApiProxy: vi.fn(),
}));
vi.mock('@clerk/backend/proxy', async () => {
  const actual = await vi.importActual('@clerk/backend/proxy');
  return {
    ...actual,
    clerkFrontendApiProxy: mockClerkFrontendApiProxy,
  };
});

const { mockCreateClerkClient } = vi.hoisted(() => ({
  mockCreateClerkClient: vi.fn(),
}));
vi.mock('@clerk/backend', async () => {
  const actual = await vi.importActual<typeof ClerkBackend>('@clerk/backend');
  mockCreateClerkClient.mockImplementation(actual.createClerkClient);
  return {
    ...actual,
    createClerkClient: mockCreateClerkClient,
  };
});

const { mockWarnOnce } = vi.hoisted(() => ({
  mockWarnOnce: vi.fn(),
}));
vi.mock('@clerk/shared/logger', () => ({
  logger: { warnOnce: mockWarnOnce, logOnce: vi.fn() },
}));

import { authenticateAndDecorateRequest, authenticateRequest } from '../authenticateRequest';
import { clerkMiddleware } from '../clerkMiddleware';
import { getAuth } from '../getAuth';
import { requireAuth } from '../requireAuth';
import { assertNoDebugHeaders, assertSignedOutDebugHeaders, runMiddleware, runMiddlewareOnPath } from './helpers';

describe('clerkMiddleware', () => {
  // TODO(dimkl): Fix issue that makes test order matter, until then keep this test suite first
  describe('without secretKey env', () => {
    const sk = process.env.CLERK_SECRET_KEY;

    beforeEach(() => {
      delete process.env.CLERK_SECRET_KEY;
    });

    afterEach(() => {
      process.env.CLERK_SECRET_KEY = sk;
    });

    it('throws error if secretKey is not passed as parameter', async () => {
      const response = await runMiddleware(clerkMiddleware()).expect(500);

      assertNoDebugHeaders(response);
    });

    it('works if secretKey is passed as parameter', async () => {
      const options = { secretKey: 'sk_test_....' };

      const response = await runMiddleware(clerkMiddleware(options), { Cookie: '__clerk_db_jwt=deadbeef;' }).expect(
        200,
        'Hello world!',
      );

      assertSignedOutDebugHeaders(response);
    });
  });

  // TODO(dimkl): Fix issue that makes test order matter, until then keep this test suite second
  describe('without publishableKey env', () => {
    const pk = process.env.CLERK_PUBLISHABLE_KEY;

    beforeEach(() => {
      delete process.env.CLERK_PUBLISHABLE_KEY;
    });

    afterEach(() => {
      process.env.CLERK_PUBLISHABLE_KEY = pk;
    });

    it('throws error if publishableKey is not passed as parameter', async () => {
      const response = await runMiddleware(clerkMiddleware()).expect(500);

      assertNoDebugHeaders(response);
    });

    it('works if publishableKey is passed as parameter', async () => {
      const options = { publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k' };

      const response = await runMiddleware(clerkMiddleware(options), { Cookie: '__clerk_db_jwt=deadbeef;' }).expect(
        200,
        'Hello world!',
      );

      assertSignedOutDebugHeaders(response);
    });
  });

  it.todo('supports usage without invocation: app.use(clerkMiddleware)');

  it('supports usage without parameters: app.use(clerkMiddleware())', async () => {
    await runMiddleware(clerkMiddleware(), { Cookie: '__clerk_db_jwt=deadbeef;' }).expect(200, 'Hello world!');
  });

  it('supports usage with parameters: app.use(clerkMiddleware(options))', async () => {
    const options = { publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k' };

    const response = await runMiddleware(clerkMiddleware(options), { Cookie: '__clerk_db_jwt=deadbeef;' }).expect(
      200,
      'Hello world!',
    );

    assertSignedOutDebugHeaders(response);
  });

  it('forwards clockSkewInMs to authenticateRequest', async () => {
    const authenticateRequestMock = vi.fn().mockResolvedValue({});
    const clerkClient = {
      authenticateRequest: authenticateRequestMock,
    } as any;

    await authenticateRequest({
      clerkClient,
      request: {
        method: 'GET',
        url: '/',
        headers: {
          host: 'example.com',
        },
      } as Request,
      options: {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_....',
        clockSkewInMs: 12_345,
      },
    });

    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        clockSkewInMs: 12_345,
      }),
    );
  });

  it('forwards arbitrary AuthenticateRequestOptions/VerifyTokenOptions to authenticateRequest', async () => {
    const authenticateRequestMock = vi.fn().mockResolvedValue({});
    const clerkClient = {
      authenticateRequest: authenticateRequestMock,
    } as any;

    const organizationSyncOptions = {
      organizationPatterns: ['/orgs/:slug'],
    };

    await authenticateRequest({
      clerkClient,
      request: {
        method: 'GET',
        url: '/',
        headers: {
          host: 'example.com',
        },
      } as Request,
      options: {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_....',
        clockSkewInMs: 12_345,
        audience: 'https://api.example.com',
        authorizedParties: ['https://example.com'],
        jwtKey: 'jwt-key-value',
        acceptsToken: 'session_token',
        organizationSyncOptions,
        skipJwksCache: true,
        headerType: 'JWT',
      } as any,
    });

    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        audience: 'https://api.example.com',
        authorizedParties: ['https://example.com'],
        clockSkewInMs: 12_345,
        jwtKey: 'jwt-key-value',
        acceptsToken: 'session_token',
        organizationSyncOptions,
        skipJwksCache: true,
        headerType: 'JWT',
      }),
    );
  });

  it('does not forward middleware-only options (clerkClient, debug, frontendApiProxy) to authenticateRequest', async () => {
    const authenticateRequestMock = vi.fn().mockResolvedValue({});
    const clerkClient = {
      authenticateRequest: authenticateRequestMock,
    } as any;

    await authenticateRequest({
      clerkClient,
      request: {
        method: 'GET',
        url: '/',
        headers: {
          host: 'example.com',
        },
      } as Request,
      options: {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_....',
        clerkClient,
        debug: true,
        frontendApiProxy: { enabled: true, path: '/__clerk' },
      },
    });

    const forwarded = authenticateRequestMock.mock.calls[0][1];
    expect(forwarded).not.toHaveProperty('clerkClient');
    expect(forwarded).not.toHaveProperty('debug');
    expect(forwarded).not.toHaveProperty('frontendApiProxy');
  });

  describe('apiUrl/apiVersion default-client construction', () => {
    beforeEach(() => {
      mockCreateClerkClient.mockClear();
    });

    it('builds a per-middleware ClerkClient with apiUrl when no custom clerkClient is supplied', () => {
      authenticateAndDecorateRequest({
        apiUrl: 'https://api.example.test',
        secretKey: 'sk_test_....',
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
      });

      expect(mockCreateClerkClient).toHaveBeenCalledWith(
        expect.objectContaining({ apiUrl: 'https://api.example.test' }),
      );
    });

    it('builds a per-middleware ClerkClient with apiVersion when no custom clerkClient is supplied', () => {
      authenticateAndDecorateRequest({
        apiVersion: 'v2',
        secretKey: 'sk_test_....',
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
      });

      expect(mockCreateClerkClient).toHaveBeenCalledWith(expect.objectContaining({ apiVersion: 'v2' }));
    });

    it('does not call createClerkClient at construction when apiUrl/apiVersion are not set', () => {
      authenticateAndDecorateRequest({ secretKey: 'sk_test_....' });

      expect(mockCreateClerkClient).not.toHaveBeenCalled();
    });

    it('does not build a per-middleware client when the caller supplies their own clerkClient', () => {
      const customClient = { authenticateRequest: vi.fn() } as any;

      authenticateAndDecorateRequest({
        apiUrl: 'https://api.example.test',
        apiVersion: 'v2',
        clerkClient: customClient,
      });

      expect(mockCreateClerkClient).not.toHaveBeenCalled();
    });

    it('routes outbound API traffic to the apiUrl override', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{"data":[],"total_count":0}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

      authenticateAndDecorateRequest({
        apiUrl: 'https://api.example.test',
        secretKey: 'sk_test_....',
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
      });

      const client = mockCreateClerkClient.mock.results[0].value;
      await client.users.getUserList().catch(() => undefined);

      const calledUrls = fetchSpy.mock.calls.map(call => {
        const input = call[0];
        if (typeof input === 'string') {
          return input;
        }
        if (input instanceof URL) {
          return input.href;
        }
        return input.url;
      });
      expect(calledUrls.some(url => new URL(url).origin === 'https://api.example.test')).toBe(true);

      fetchSpy.mockRestore();
    });

    it('callback form: builds a per-middleware ClerkClient when the callback returns apiUrl', async () => {
      await runMiddleware(
        clerkMiddleware(() => ({
          apiUrl: 'https://api.example.test',
          secretKey: 'sk_test_....',
          publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        })),
      ).expect(200);

      expect(mockCreateClerkClient).toHaveBeenCalledWith(
        expect.objectContaining({ apiUrl: 'https://api.example.test' }),
      );
    });
  });

  it('throws error if clerkMiddleware is not executed before getAuth', async () => {
    const customMiddleware: RequestHandler = (request, response, next) => {
      const auth = getAuth(request);
      response.setHeader('x-custom-middleware', auth.userId || '');
      return next();
    };

    const response = await runMiddleware([customMiddleware]).expect(500);

    assertNoDebugHeaders(response);
    expect(response.header).not.toHaveProperty('x-clerk-auth-custom', 'custom-value');
  });

  it('handshake flow supported by default', async () => {
    const response = await runMiddleware(clerkMiddleware(), {
      Cookie: '__client_uat=1711618859;',
      'Sec-Fetch-Dest': 'document',
    }).expect(307);

    expect(response.header).toHaveProperty('x-clerk-auth-status', 'handshake');
    expect(response.header).toHaveProperty('location', expect.stringContaining('/v1/client/handshake?redirect_url='));
  });

  describe('foreign req.auth values (authentication bypass hardening)', () => {
    beforeEach(() => {
      mockWarnOnce.mockClear();
    });

    it('authenticates the request even when a previous middleware set req.auth to a plain object (express-jwt style)', async () => {
      const foreignAuth: RequestHandler = (req, _res, next) => {
        Object.assign(req, { auth: { sub: 'attacker' } });
        next();
      };

      const response = await runMiddleware([foreignAuth, clerkMiddleware()], {
        Cookie: '__clerk_db_jwt=deadbeef;',
      }).expect(200, 'Hello world!');

      assertSignedOutDebugHeaders(response);
      expect(mockWarnOnce).toHaveBeenCalledTimes(1);
    });

    it('overwrites a foreign req.auth function so getAuth returns Clerk state', async () => {
      const foreignAuth: RequestHandler = (req, _res, next) => {
        Object.assign(req, { auth: () => ({ userId: 'attacker' }) });
        next();
      };

      let capturedUserId: string | null | undefined;
      const capture: RequestHandler = (req, _res, next) => {
        capturedUserId = getAuth(req).userId;
        next();
      };

      const response = await runMiddleware([foreignAuth, clerkMiddleware(), capture], {
        Cookie: '__clerk_db_jwt=deadbeef;',
      }).expect(200, 'Hello world!');

      assertSignedOutDebugHeaders(response);
      expect(capturedUserId).toBeNull();
    });

    it('does not re-authenticate when clerkMiddleware runs twice', async () => {
      const authenticateRequestSpy = vi.fn().mockResolvedValue({
        headers: new Headers(),
        status: 'signed-out',
        toAuth: () => ({ userId: null }),
      });
      const clerkClient = { authenticateRequest: authenticateRequestSpy } as any;

      await runMiddleware([clerkMiddleware({ clerkClient }), clerkMiddleware({ clerkClient })]).expect(
        200,
        'Hello world!',
      );

      expect(authenticateRequestSpy).toHaveBeenCalledTimes(1);
      expect(mockWarnOnce).not.toHaveBeenCalled();
    });

    it('requireAuth is not bypassed by a foreign req.auth that reports a userId', async () => {
      const foreignAuth: RequestHandler = (req, _res, next) => {
        Object.assign(req, { auth: () => ({ userId: 'attacker' }) });
        next();
      };

      const response = await runMiddleware([foreignAuth, requireAuth({ signInUrl: '/sign-in' })]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/sign-in');
    });

    it('requireAuth redirects (does not 500) when a foreign req.auth is a plain object', async () => {
      const foreignAuth: RequestHandler = (req, _res, next) => {
        Object.assign(req, { auth: { sub: 'attacker' } });
        next();
      };

      const response = await runMiddleware([foreignAuth, requireAuth({ signInUrl: '/sign-in' })]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/sign-in');
    });
  });

  describe('Frontend API proxy handling', () => {
    beforeEach(() => {
      mockClerkFrontendApiProxy.mockReset();
    });

    it('intercepts proxy path with query parameters', async () => {
      mockClerkFrontendApiProxy.mockResolvedValueOnce(new globalThis.Response('proxied', { status: 200 }));

      await runMiddlewareOnPath(
        clerkMiddleware({ frontendApiProxy: { enabled: true } }),
        '/__clerk?_clerk_js_version=5.0.0',
        {},
      ).expect(200);

      expect(mockClerkFrontendApiProxy).toHaveBeenCalled();
    });

    it('authenticates default path when custom proxy path is set', async () => {
      // When using a custom path, the default /__clerk should be authenticated
      const response = await runMiddlewareOnPath(
        clerkMiddleware({ frontendApiProxy: { enabled: true, path: '/custom-clerk-proxy' } }),
        '/__clerk/v1/client',
        {
          Cookie: '__client_uat=1711618859;',
          'Sec-Fetch-Dest': 'document',
        },
      ).expect(307);

      expect(response.header).toHaveProperty('x-clerk-auth-status', 'handshake');
    });

    it('authenticates proxy paths when enabled is false', async () => {
      const response = await runMiddlewareOnPath(
        clerkMiddleware({ frontendApiProxy: { enabled: false } }),
        '/__clerk/v1/client',
        {
          Cookie: '__client_uat=1711618859;',
          'Sec-Fetch-Dest': 'document',
        },
      ).expect(307);

      expect(response.header).toHaveProperty('x-clerk-auth-status', 'handshake');
    });

    it('does not handle proxy paths when frontendApiProxy is not configured', async () => {
      // Without frontendApiProxy option, proxy paths go through normal auth
      const response = await runMiddlewareOnPath(clerkMiddleware(), '/__clerk/v1/client', {
        Cookie: '__client_uat=1711618859;',
        'Sec-Fetch-Dest': 'document',
      }).expect(307);

      expect(response.header).toHaveProperty('x-clerk-auth-status', 'handshake');
    });

    it('falls back to default proxy path when path reduces to empty string', async () => {
      mockClerkFrontendApiProxy.mockResolvedValueOnce(new globalThis.Response('proxied', { status: 200 }));

      // path: '/' strips to '' — should fall back to DEFAULT_PROXY_PATH (/__clerk)
      // and only intercept /__clerk, not every request
      await runMiddlewareOnPath(
        clerkMiddleware({ frontendApiProxy: { enabled: true, path: '/' } }),
        '/__clerk/v1/client',
        {},
      ).expect(200);

      expect(mockClerkFrontendApiProxy).toHaveBeenCalled();
    });

    it('does not intercept non-proxy paths when path reduces to empty string', async () => {
      // path: '/' strips to '' — without the fallback guard, this would match everything
      const response = await runMiddlewareOnPath(
        clerkMiddleware({ frontendApiProxy: { enabled: true, path: '/' } }),
        '/api/users',
        {
          Cookie: '__client_uat=1711618859;',
          'Sec-Fetch-Dest': 'document',
        },
      ).expect(307);

      expect(response.header).toHaveProperty('x-clerk-auth-status', 'handshake');
      expect(mockClerkFrontendApiProxy).not.toHaveBeenCalled();
    });

    it('still authenticates requests to other paths when proxy is configured', async () => {
      const response = await runMiddlewareOnPath(
        clerkMiddleware({ frontendApiProxy: { enabled: true } }),
        '/api/users',
        {
          Cookie: '__client_uat=1711618859;',
          'Sec-Fetch-Dest': 'document',
        },
      ).expect(307);

      expect(response.header).toHaveProperty('x-clerk-auth-status', 'handshake');
    });
  });

  describe('with options callback', () => {
    it('accepts a callback function and resolves options per request', async () => {
      const optionsCallback = vi.fn().mockResolvedValue({
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_....',
      });

      const response = await runMiddleware(clerkMiddleware(optionsCallback), {
        Cookie: '__clerk_db_jwt=deadbeef;',
      }).expect(200, 'Hello world!');

      expect(optionsCallback).toHaveBeenCalledOnce();
      assertSignedOutDebugHeaders(response);
    });

    it('calls the callback with the incoming request', async () => {
      let capturedHostname: string | undefined;

      const optionsCallback = vi.fn().mockImplementation((req: Request) => {
        capturedHostname = req.hostname;
        return Promise.resolve({
          publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
          secretKey: 'sk_test_....',
        });
      });

      await runMiddleware(clerkMiddleware(optionsCallback), {
        Cookie: '__clerk_db_jwt=deadbeef;',
        Host: 'example.com',
      }).expect(200, 'Hello world!');

      expect(capturedHostname).toBe('example.com');
    });

    it('accepts a synchronous callback (non-Promise return)', async () => {
      const optionsCallback = vi.fn().mockReturnValue({
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_....',
      });

      const response = await runMiddleware(clerkMiddleware(optionsCallback), {
        Cookie: '__clerk_db_jwt=deadbeef;',
      }).expect(200, 'Hello world!');

      assertSignedOutDebugHeaders(response);
    });
  });

  it('calls next with an error when request URL is invalid', () => {
    const req = {
      url: '//',
      cookies: {},
      headers: { host: 'example.com' },
    } as Request;
    const res = {} as Response;
    const mockNext = vi.fn();

    clerkMiddleware()(req, res, mockNext);

    expect(mockNext.mock.calls[0][0].message).toBe('Invalid URL');

    mockNext.mockReset();
  });
});
