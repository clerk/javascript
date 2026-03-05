import { clerkFrontendApiProxy } from '@clerk/backend/proxy';
import { Hono } from 'hono';

import { clerkMiddleware, getAuth } from '../index';

const EnvVariables = {
  CLERK_SECRET_KEY: 'TEST_API_KEY',
  CLERK_PUBLISHABLE_KEY: 'TEST_API_KEY',
};

const createMockSessionAuth = () => ({
  tokenType: 'session_token' as const,
  userId: 'user_123',
  sessionId: 'sess_456',
  orgId: null,
  orgRole: null,
  orgSlug: null,
});

const authenticateRequestMock = vi.fn();

vi.mock(import('@clerk/backend'), async importOriginal => {
  const original = await importOriginal();

  return {
    ...original,
    createClerkClient(options: Parameters<typeof original.createClerkClient>[0]) {
      const client = original.createClerkClient(options);
      vi.spyOn(client, 'authenticateRequest').mockImplementation(authenticateRequestMock);
      return client;
    },
  };
});

vi.mock(import('@clerk/backend/proxy'), async importOriginal => {
  const original = await importOriginal();
  return {
    ...original,
    clerkFrontendApiProxy: vi.fn().mockResolvedValue(new Response('proxy-response', { status: 200 })),
  };
});

const mockClerkFrontendApiProxy = vi.mocked(clerkFrontendApiProxy);

describe('clerkMiddleware()', () => {
  beforeEach(() => {
    vi.stubEnv('CLERK_SECRET_KEY', EnvVariables.CLERK_SECRET_KEY);
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', EnvVariables.CLERK_PUBLISHABLE_KEY);
    authenticateRequestMock.mockReset();
  });

  test('handles signin with Authorization Bearer', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: createMockSessionAuth,
    });
    const app = new Hono();
    app.use('*', clerkMiddleware());

    app.get('/', c => {
      const auth = getAuth(c);
      return c.json({ auth });
    });

    const req = new Request('http://localhost/', {
      headers: {
        Authorization: 'Bearer deadbeef',
        Origin: 'http://origin.com',
        Host: 'host.com',
        'X-Forwarded-Port': '1234',
        'X-Forwarded-Host': 'forwarded-host.com',
        Referer: 'referer.com',
        'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      },
    });

    const response = await app.request(req);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ auth: createMockSessionAuth() });
    expect(authenticateRequestMock).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: EnvVariables.CLERK_SECRET_KEY,
      }),
    );
  });

  test('handles signin with cookie', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: createMockSessionAuth,
    });
    const app = new Hono();
    app.use('*', clerkMiddleware());

    app.get('/', c => {
      const auth = getAuth(c);
      return c.json({ auth });
    });

    const req = new Request('http://localhost/', {
      headers: {
        cookie: '_gcl_au=value1; ko_id=value2; __session=deadbeef; __client_uat=1675692233',
        Origin: 'http://origin.com',
        Host: 'host.com',
      },
    });

    const response = await app.request(req);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ auth: createMockSessionAuth() });
  });

  test('handles handshake by redirecting to FAPI', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: 'handshake',
      reason: 'auth-reason',
      message: 'auth-message',
      headers: new Headers({
        location: 'https://fapi.example.com/v1/clients/handshake',
        'x-clerk-auth-message': 'auth-message',
        'x-clerk-auth-reason': 'auth-reason',
        'x-clerk-auth-status': 'handshake',
      }),
      toAuth: createMockSessionAuth,
    });
    const app = new Hono();
    app.use('*', clerkMiddleware());

    app.get('/', c => {
      const auth = getAuth(c);
      return c.json({ auth });
    });

    const req = new Request('http://localhost/', {
      headers: {
        cookie: '__session=deadbeef; __client_uat=1675692233',
      },
    });

    const response = await app.request(req);

    expect(response.status).toEqual(307);
    expect(Object.fromEntries(response.headers.entries())).toMatchObject({
      location: 'https://fapi.example.com/v1/clients/handshake',
      'x-clerk-auth-status': 'handshake',
      'x-clerk-auth-reason': 'auth-reason',
      'x-clerk-auth-message': 'auth-message',
    });
  });

  test('throws error when secret key is missing', async () => {
    vi.stubEnv('CLERK_SECRET_KEY', '');
    const app = new Hono();
    app.use('*', clerkMiddleware());
    app.get('/', c => c.json({ ok: true }));

    const response = await app.request(new Request('http://localhost/'));

    expect(response.status).toEqual(500);
  });

  test('throws error when publishable key is missing', async () => {
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '');
    const app = new Hono();
    app.use('*', clerkMiddleware());
    app.get('/', c => c.json({ ok: true }));

    const response = await app.request(new Request('http://localhost/'));

    expect(response.status).toEqual(500);
  });

  describe('frontendApiProxy', () => {
    beforeEach(() => {
      mockClerkFrontendApiProxy.mockReset();
      mockClerkFrontendApiProxy.mockResolvedValue(new Response('proxy-response', { status: 200 }));
    });

    test('proxies requests to the default proxy path when enabled', async () => {
      const app = new Hono();
      app.use('*', clerkMiddleware({ frontendApiProxy: { enabled: true } }));
      app.get('/', c => c.json({ ok: true }));

      const response = await app.request(new Request('http://localhost/__clerk/v1/client'));

      expect(response.status).toEqual(200);
      expect(await response.text()).toEqual('proxy-response');
      expect(mockClerkFrontendApiProxy).toHaveBeenCalled();
      expect(authenticateRequestMock).not.toHaveBeenCalled();
    });

    test('proxies requests to custom proxy path', async () => {
      const app = new Hono();
      app.use('*', clerkMiddleware({ frontendApiProxy: { enabled: true, path: '/custom-proxy' } }));
      app.get('/', c => c.json({ ok: true }));

      const response = await app.request(new Request('http://localhost/custom-proxy/v1/client'));

      expect(response.status).toEqual(200);
      expect(mockClerkFrontendApiProxy).toHaveBeenCalled();
    });

    test('does not proxy when enabled is false', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockSessionAuth,
      });
      const app = new Hono();
      app.use('*', clerkMiddleware({ frontendApiProxy: { enabled: false } }));
      app.get('/__clerk/v1/client', c => c.json({ ok: true }));

      const response = await app.request(new Request('http://localhost/__clerk/v1/client'));

      expect(response.status).toEqual(200);
      expect(mockClerkFrontendApiProxy).not.toHaveBeenCalled();
      expect(authenticateRequestMock).toHaveBeenCalled();
    });

    test('does not proxy non-matching paths', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockSessionAuth,
      });
      const app = new Hono();
      app.use('*', clerkMiddleware({ frontendApiProxy: { enabled: true } }));
      app.get('/api/users', c => c.json({ ok: true }));

      const response = await app.request(new Request('http://localhost/api/users'));

      expect(response.status).toEqual(200);
      expect(mockClerkFrontendApiProxy).not.toHaveBeenCalled();
      expect(authenticateRequestMock).toHaveBeenCalled();
    });

    test('supports enabled as a function', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockSessionAuth,
      });
      const enabledFn = vi.fn().mockReturnValue(false);
      const app = new Hono();
      app.use('*', clerkMiddleware({ frontendApiProxy: { enabled: enabledFn } }));
      app.get('/__clerk/v1/client', c => c.json({ ok: true }));

      const response = await app.request(new Request('http://localhost/__clerk/v1/client'));

      expect(response.status).toEqual(200);
      expect(enabledFn).toHaveBeenCalledWith(expect.any(URL));
      expect(mockClerkFrontendApiProxy).not.toHaveBeenCalled();
    });

    test('auto-derives proxyUrl for authenticateRequest when frontendApiProxy is enabled', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        headers: new Headers(),
        toAuth: createMockSessionAuth,
      });
      const app = new Hono();
      app.use('*', clerkMiddleware({ frontendApiProxy: { enabled: true } }));
      app.get('/api/users', c => c.json({ ok: true }));

      await app.request(new Request('http://localhost/api/users'));

      expect(authenticateRequestMock).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          proxyUrl: 'http://localhost/__clerk',
        }),
      );
    });
  });
});

describe('getAuth()', () => {
  beforeEach(() => {
    vi.stubEnv('CLERK_SECRET_KEY', EnvVariables.CLERK_SECRET_KEY);
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', EnvVariables.CLERK_PUBLISHABLE_KEY);
    authenticateRequestMock.mockReset();
  });

  test('throws error when called without middleware', async () => {
    const app = new Hono();
    app.get('/', c => {
      const auth = getAuth(c);
      return c.json({ auth });
    });

    const response = await app.request(new Request('http://localhost/'));

    expect(response.status).toEqual(500);
  });

  test('handles acceptsToken option for API keys', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'api_key',
        id: 'ak_1234',
        userId: 'user_456',
        orgId: null,
      }),
    });
    const app = new Hono();
    app.use('*', clerkMiddleware());

    app.get('/', c => {
      const auth = getAuth(c, { acceptsToken: 'api_key' });
      return c.json({ auth });
    });

    const req = new Request('http://localhost/', {
      headers: {
        Authorization: 'Bearer ak_deadbeef',
      },
    });

    const response = await app.request(req);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({
      auth: {
        tokenType: 'api_key',
        id: 'ak_1234',
        userId: 'user_456',
        orgId: null,
      },
    });
  });

  test('handles acceptsToken option as array', async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      headers: new Headers(),
      toAuth: () => ({
        tokenType: 'api_key',
        id: 'ak_5678',
        userId: 'user_789',
        orgId: null,
      }),
    });
    const app = new Hono();
    app.use('*', clerkMiddleware());

    app.get('/', c => {
      const auth = getAuth(c, { acceptsToken: ['api_key', 'session_token'] });
      return c.json({ auth });
    });

    const req = new Request('http://localhost/', {
      headers: {
        Authorization: 'Bearer ak_deadbeef',
      },
    });

    const response = await app.request(req);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({
      auth: {
        tokenType: 'api_key',
        id: 'ak_5678',
        userId: 'user_789',
        orgId: null,
      },
    });
  });
});
