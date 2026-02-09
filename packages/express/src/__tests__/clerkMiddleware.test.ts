import type { Request, RequestHandler, Response } from 'express';
import { vi } from 'vitest';

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

import { clerkMiddleware } from '../clerkMiddleware';
import { getAuth } from '../getAuth';
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

  it('can disable handshake flow', async () => {
    const response = await runMiddleware(clerkMiddleware({ enableHandshake: false }), {
      Cookie: '__client_uat=1711618859;',
      'Sec-Fetch-Dest': 'document',
    }).expect(200);

    assertNoDebugHeaders(response);
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
