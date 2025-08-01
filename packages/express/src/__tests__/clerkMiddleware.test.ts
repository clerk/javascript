import type { Request, RequestHandler, Response } from 'express';
import { vi } from 'vitest';

import { clerkMiddleware } from '../clerkMiddleware';
import { getAuth } from '../getAuth';
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
