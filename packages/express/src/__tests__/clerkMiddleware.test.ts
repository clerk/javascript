import type { Request, RequestHandler, Response } from 'express';

import { clerkMiddleware } from '../clerkMiddleware';
import { getAuth } from '../getAuth';
import { requireAuth } from '../requireAuth';
import { assertNoDebugHeaders, assertSignedOutDebugHeaders, runMiddleware } from './helpers';

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
      const response = await runMiddleware(clerkMiddleware({ enableHandshake: true })).expect(500);

      assertNoDebugHeaders(response);
    });

    it('works if secretKey is passed as parameter', async () => {
      const options = { secretKey: 'sk_test_....', enableHandshake: true };

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
      const options = { publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k', enableHandshake: true };

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
    const options = { publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k', enableHandshake: true };

    const response = await runMiddleware(clerkMiddleware(options), { Cookie: '__clerk_db_jwt=deadbeef;' }).expect(
      200,
      'Hello world!',
    );

    assertSignedOutDebugHeaders(response);
  });

  it('supports usage with request handler: app.use(clerkMiddleware(requestHandler))', async () => {
    const handler: RequestHandler = (_req, res, next) => {
      res.setHeader('x-clerk-auth-custom', 'custom-value');
      return next();
    };

    const response = await runMiddleware(clerkMiddleware(handler, { enableHandshake: true }), {
      Cookie: '__clerk_db_jwt=deadbeef;',
    }).expect(200, 'Hello world!');

    expect(response.header).toHaveProperty('x-clerk-auth-custom', 'custom-value');
    assertSignedOutDebugHeaders(response);
  });

  it('supports usage with parameters and request handler: app.use(clerkMiddleware(requestHandler, options))', async () => {
    const handler: RequestHandler = (_req, res, next) => {
      res.setHeader('x-clerk-auth-custom', 'custom-value');
      return next();
    };
    const options = { publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k', enableHandshake: true };

    const response = await runMiddleware(clerkMiddleware(handler, options), {
      Cookie: '__clerk_db_jwt=deadbeef;',
    }).expect(200, 'Hello world!');

    expect(response.header).toHaveProperty('x-clerk-auth-custom', 'custom-value');
    assertSignedOutDebugHeaders(response);
  });

  it('throws error if clerkMiddleware is not executed before requireAuth', async () => {
    const customMiddleware: RequestHandler = (_request, response, next) => {
      response.setHeader('x-custom-middleware', 'custom');
      return next();
    };

    const response = await runMiddleware([requireAuth, customMiddleware]).expect(500);

    assertNoDebugHeaders(response);
    expect(response.header).not.toHaveProperty('x-clerk-auth-custom', 'custom-value');
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

  it('disables handshake flow by default', async () => {
    const response = await runMiddleware(clerkMiddleware(), {
      Cookie: '__client_uat=1711618859;',
      'Sec-Fetch-Dest': 'document',
    }).expect(200);

    assertNoDebugHeaders(response);
  });

  it('supports handshake flow', async () => {
    const response = await runMiddleware(clerkMiddleware({ enableHandshake: true }), {
      Cookie: '__client_uat=1711618859;',
      'Sec-Fetch-Dest': 'document',
    }).expect(307);

    expect(response.header).toHaveProperty('x-clerk-auth-status', 'handshake');
    expect(response.header).toHaveProperty('location', expect.stringContaining('/v1/client/handshake?redirect_url='));
  });

  it('calls next with an error when request URL is invalid', () => {
    const req = {
      url: '//',
      cookies: {},
      headers: { host: 'example.com' },
    } as Request;
    const res = {} as Response;
    const mockNext = jest.fn();

    clerkMiddleware()[0](req, res, mockNext);

    expect(mockNext.mock.calls[0][0].message).toBe('Invalid URL');

    mockNext.mockReset();
  });
});
