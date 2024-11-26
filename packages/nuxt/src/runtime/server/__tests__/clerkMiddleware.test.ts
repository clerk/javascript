import { createApp, eventHandler, setResponseHeader, toWebHandler } from 'h3';
import { vi } from 'vitest';

import { clerkMiddleware } from '../clerkMiddleware';

const AUTH_RESPONSE = {
  userId: 'user_2jZSstSbxtTndD9P7q4kDl0VVZa',
  sessionId: 'sess_2jZSstSbxtTndD9P7q4kDl0VVZa',
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
  toAuth: () => AUTH_RESPONSE,
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
      eventHandler(event => event.context.auth),
    );
    const response = await handler(new Request(new URL('/', 'http://localhost')));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(AUTH_RESPONSE);
  });

  test('renders route as normally when used with options param', async () => {
    const app = createApp();
    const handler = toWebHandler(app);
    app.use(clerkMiddleware(MOCK_OPTIONS));
    app.use(
      '/',
      eventHandler(event => event.context.auth),
    );
    const response = await handler(new Request(new URL('/', 'http://localhostx')));

    expect(response.status).toBe(200);
    expect(authenticateRequestMock).toHaveBeenCalledWith(expect.any(Request), expect.objectContaining(MOCK_OPTIONS));
    expect(await response.json()).toEqual(AUTH_RESPONSE);
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
      eventHandler(event => event.context.auth),
    );
    const response = await handler(new Request(new URL('/', 'http://localhost')));

    expect(response.status).toBe(200);
    expect(response.headers.get('a-custom-header')).toBe('1');
    expect(await response.json()).toEqual(AUTH_RESPONSE);
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
      eventHandler(event => event.context.auth),
    );
    const response = await handler(new Request(new URL('/', 'http://localhost')));

    expect(response.status).toBe(200);
    expect(response.headers.get('a-custom-header')).toBe('1');
    expect(authenticateRequestMock).toHaveBeenCalledWith(expect.any(Request), expect.objectContaining(MOCK_OPTIONS));
    expect(await response.json()).toEqual(AUTH_RESPONSE);
  });
});
