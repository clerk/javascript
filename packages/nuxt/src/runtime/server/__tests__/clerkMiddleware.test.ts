import { createApp, eventHandler, setResponseHeader, toWebHandler } from 'h3';
import { vi } from 'vitest';

import { clerkMiddleware } from '../clerkMiddleware';

const SESSION_AUTH_RESPONSE = {
  userId: 'user_2jZSstSbxtTndD9P7q4kDl0VVZa',
  sessionId: 'sess_2jZSstSbxtTndD9P7q4kDl0VVZa',
  tokenType: 'session_token',
  isAuthenticated: true,
  sessionStatus: 'active',
  sessionClaims: {},
  actor: null,
  factorVerificationAge: null,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  orgPermissions: null,
};

const MACHINE_AUTH_RESPONSE = {
  id: 'ak_123456789',
  subject: 'user_2jZSstSbxtTndD9P7q4kDl0VVZa',
  scopes: ['read:users', 'write:users'],
  tokenType: 'api_key',
  isAuthenticated: true,
  name: 'Test API Key',
  claims: { custom: 'claim' },
  userId: 'user_2jZSstSbxtTndD9P7q4kDl0VVZa',
  orgId: null,
};

const MOCK_OPTIONS = {
  secretKey: 'sk_test_xxxxxxxxxxxxxxxxxx',
  publishableKey: 'pk_test_xxxxxxxxxxxxx',
  signInUrl: '/foo',
  signUpUrl: '/bar',
};

vi.mock('#imports', () => {
  return {
    useRuntimeConfig: () => ({}),
  };
});

const authenticateRequestMock = vi.fn().mockResolvedValue({
  toAuth: () => SESSION_AUTH_RESPONSE,
  headers: new Headers(),
});

vi.mock('../clerkClient', () => {
  return {
    clerkClient: () => ({
      authenticateRequest: authenticateRequestMock,
      telemetry: { record: vi.fn() },
    }),
  };
});

describe('clerkMiddleware(params)', () => {
  test('renders route as normally when used without params', async () => {
    const app = createApp();
    const handler = toWebHandler(app);
    app.use(clerkMiddleware());
    app.use(
      '/',
      eventHandler(event => event.context.auth()),
    );
    const response = await handler(new Request(new URL('/', 'http://localhost')));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(SESSION_AUTH_RESPONSE);
  });

  test('renders route as normally when used with options param', async () => {
    const app = createApp();
    const handler = toWebHandler(app);
    app.use(clerkMiddleware(MOCK_OPTIONS));
    app.use(
      '/',
      eventHandler(event => event.context.auth()),
    );
    const response = await handler(new Request(new URL('/', 'http://localhost')));

    expect(response.status).toBe(200);
    expect(authenticateRequestMock).toHaveBeenCalledWith(expect.any(Request), expect.objectContaining(MOCK_OPTIONS));
    expect(await response.json()).toEqual(SESSION_AUTH_RESPONSE);
  });

  test('executes handler and renders route when used with a custom handler', async () => {
    const app = createApp();
    const handler = toWebHandler(app);
    app.use(
      clerkMiddleware(event => {
        setResponseHeader(event, 'a-custom-header', '1');
      }),
    );
    app.use(
      '/',
      eventHandler(event => event.context.auth()),
    );
    const response = await handler(new Request(new URL('/', 'http://localhost')));

    expect(response.status).toBe(200);
    expect(response.headers.get('a-custom-header')).toBe('1');
    expect(await response.json()).toEqual(SESSION_AUTH_RESPONSE);
  });

  test('executes handler and renders route when used with a custom handler and options', async () => {
    const app = createApp();
    const handler = toWebHandler(app);
    app.use(
      clerkMiddleware(event => {
        setResponseHeader(event, 'a-custom-header', '1');
      }, MOCK_OPTIONS),
    );
    app.use(
      '/',
      eventHandler(event => event.context.auth()),
    );
    const response = await handler(new Request(new URL('/', 'http://localhost')));

    expect(response.status).toBe(200);
    expect(response.headers.get('a-custom-header')).toBe('1');
    expect(authenticateRequestMock).toHaveBeenCalledWith(expect.any(Request), expect.objectContaining(MOCK_OPTIONS));
    expect(await response.json()).toEqual(SESSION_AUTH_RESPONSE);
  });

  describe('machine authentication', () => {
    test('returns machine auth object when acceptsToken is machine token type', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        toAuth: () => MACHINE_AUTH_RESPONSE,
        headers: new Headers(),
      });

      const app = createApp();
      const handler = toWebHandler(app);
      app.use(clerkMiddleware());
      app.use(
        '/',
        eventHandler(event => event.context.auth({ acceptsToken: 'api_key' })),
      );
      const response = await handler(new Request(new URL('/', 'http://localhost')));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(MACHINE_AUTH_RESPONSE);
    });

    test('returns machine auth object when acceptsToken array includes machine token type', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        toAuth: () => MACHINE_AUTH_RESPONSE,
        headers: new Headers(),
      });

      const app = createApp();
      const handler = toWebHandler(app);
      app.use(clerkMiddleware());
      app.use(
        '/',
        eventHandler(event => event.context.auth({ acceptsToken: ['session_token', 'api_key'] })),
      );
      const response = await handler(new Request(new URL('/', 'http://localhost')));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(MACHINE_AUTH_RESPONSE);
    });

    test('returns any auth object when acceptsToken is any', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        toAuth: () => MACHINE_AUTH_RESPONSE,
        headers: new Headers(),
      });

      const app = createApp();
      const handler = toWebHandler(app);
      app.use(clerkMiddleware());
      app.use(
        '/',
        eventHandler(event => event.context.auth({ acceptsToken: 'any' })),
      );
      const response = await handler(new Request(new URL('/', 'http://localhost')));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(MACHINE_AUTH_RESPONSE);
    });

    test('returns unauthenticated machine object when token type does not match acceptsToken', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        toAuth: () => MACHINE_AUTH_RESPONSE,
        headers: new Headers(),
      });

      const app = createApp();
      const handler = toWebHandler(app);
      app.use(clerkMiddleware());
      app.use(
        '/',
        eventHandler(event => event.context.auth({ acceptsToken: 'm2m_token' })),
      );
      const response = await handler(new Request(new URL('/', 'http://localhost')));

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.tokenType).toBe('m2m_token');
      expect(result.isAuthenticated).toBe(false);
      expect(result.id).toBe(null);
    });

    test('returns invalid token object when token type is not in acceptsToken array', async () => {
      authenticateRequestMock.mockResolvedValueOnce({
        toAuth: () => MACHINE_AUTH_RESPONSE,
        headers: new Headers(),
      });

      const app = createApp();
      const handler = toWebHandler(app);
      app.use(clerkMiddleware());
      app.use(
        '/',
        eventHandler(event => event.context.auth({ acceptsToken: ['session_token', 'm2m_token'] })),
      );
      const response = await handler(new Request(new URL('/', 'http://localhost')));

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.tokenType).toBe(null);
      expect(result.isAuthenticated).toBe(false);
    });
  });
});
