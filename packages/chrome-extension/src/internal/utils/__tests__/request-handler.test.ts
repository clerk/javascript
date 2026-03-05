import { afterEach, describe, expect, test, vi } from 'vitest';

import { requestHandler } from '../request-handler';

function createMockJWTHandler(initialJWT: string | undefined = undefined) {
  let stored = initialJWT;
  return {
    get: vi.fn(async () => stored),
    set: vi.fn(async (value: string) => {
      stored = value;
    }),
    remove: vi.fn(async () => {
      stored = undefined;
    }),
    listener: vi.fn(),
  };
}

function createMockRequestInit() {
  return {
    credentials: 'include' as RequestCredentials,
    url: new URL('https://clerk.example.com/v1/environment'),
    headers: new Headers(),
  };
}

const FRONTEND_API = 'clerk.example.com';
const DEV_BROWSER_TOKEN = 'test-dev-browser-token';

describe('requestHandler', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');

  afterEach(() => {
    fetchSpy.mockReset();
  });

  describe('dev instance, no existing JWT', () => {
    test('POSTs to /v1/dev_browser, stores token, and appends __clerk_db_jwt', async () => {
      const jwt = createMockJWTHandler(undefined);
      const requestInit = createMockRequestInit();

      fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ token: DEV_BROWSER_TOKEN }), { status: 200 }));

      const handler = requestHandler(jwt, { isProd: false, frontendApi: FRONTEND_API });
      await handler(requestInit);

      expect(fetchSpy).toHaveBeenCalledOnce();
      expect(fetchSpy).toHaveBeenCalledWith(`https://${FRONTEND_API}/v1/dev_browser`, { method: 'POST' });
      expect(jwt.set).toHaveBeenCalledWith(DEV_BROWSER_TOKEN);
      expect(requestInit.url.searchParams.get('__clerk_db_jwt')).toBe(DEV_BROWSER_TOKEN);
    });

    test('uses data.id when data.token is not present', async () => {
      const jwt = createMockJWTHandler(undefined);
      const requestInit = createMockRequestInit();

      fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ id: 'id-based-token' }), { status: 200 }));

      const handler = requestHandler(jwt, { isProd: false, frontendApi: FRONTEND_API });
      await handler(requestInit);

      expect(jwt.set).toHaveBeenCalledWith('id-based-token');
      expect(requestInit.url.searchParams.get('__clerk_db_jwt')).toBe('id-based-token');
    });
  });

  describe('dev instance, JWT already exists', () => {
    test('uses existing token without making a fetch call', async () => {
      const jwt = createMockJWTHandler('existing-token');
      const requestInit = createMockRequestInit();

      const handler = requestHandler(jwt, { isProd: false, frontendApi: FRONTEND_API });
      await handler(requestInit);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(requestInit.url.searchParams.get('__clerk_db_jwt')).toBe('existing-token');
    });
  });

  describe('dev instance, creation fails (server error)', () => {
    test('logs error and proceeds without token', async () => {
      const jwt = createMockJWTHandler(undefined);
      const requestInit = createMockRequestInit();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      fetchSpy.mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));

      const handler = requestHandler(jwt, { isProd: false, frontendApi: FRONTEND_API });
      await handler(requestInit);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to create dev browser token'));
      expect(jwt.set).not.toHaveBeenCalled();
      expect(requestInit.url.searchParams.has('__clerk_db_jwt')).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('dev instance, creation fails (network error)', () => {
    test('logs error and proceeds without token', async () => {
      const jwt = createMockJWTHandler(undefined);
      const requestInit = createMockRequestInit();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const handler = requestHandler(jwt, { isProd: false, frontendApi: FRONTEND_API });
      await handler(requestInit);

      expect(consoleSpy).toHaveBeenCalledWith('Clerk: Failed to create dev browser token', expect.any(TypeError));
      expect(requestInit.url.searchParams.has('__clerk_db_jwt')).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('concurrent requests', () => {
    test('only one POST fires (singleton promise deduplication)', async () => {
      const jwt = createMockJWTHandler(undefined);

      fetchSpy.mockResolvedValue(new Response(JSON.stringify({ token: DEV_BROWSER_TOKEN }), { status: 200 }));

      const handler = requestHandler(jwt, { isProd: false, frontendApi: FRONTEND_API });

      const req1 = createMockRequestInit();
      const req2 = createMockRequestInit();
      const req3 = createMockRequestInit();

      await Promise.all([handler(req1), handler(req2), handler(req3)]);

      expect(fetchSpy).toHaveBeenCalledOnce();
      expect(req1.url.searchParams.get('__clerk_db_jwt')).toBe(DEV_BROWSER_TOKEN);
      expect(req2.url.searchParams.get('__clerk_db_jwt')).toBe(DEV_BROWSER_TOKEN);
      expect(req3.url.searchParams.get('__clerk_db_jwt')).toBe(DEV_BROWSER_TOKEN);
    });
  });

  describe('retry after failure', () => {
    test('subsequent requests attempt creation again after a failed attempt', async () => {
      const jwt = createMockJWTHandler(undefined);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // First call fails
      fetchSpy.mockResolvedValueOnce(new Response('Error', { status: 500 }));

      const handler = requestHandler(jwt, { isProd: false, frontendApi: FRONTEND_API });

      const req1 = createMockRequestInit();
      await handler(req1);

      expect(fetchSpy).toHaveBeenCalledOnce();
      expect(req1.url.searchParams.has('__clerk_db_jwt')).toBe(false);

      // Second call succeeds
      fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ token: DEV_BROWSER_TOKEN }), { status: 200 }));

      const req2 = createMockRequestInit();
      await handler(req2);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(req2.url.searchParams.get('__clerk_db_jwt')).toBe(DEV_BROWSER_TOKEN);

      consoleSpy.mockRestore();
    });
  });

  describe('production instance', () => {
    test('no fetch call made, no dev browser creation attempted', async () => {
      const jwt = createMockJWTHandler(undefined);
      const requestInit = createMockRequestInit();

      const handler = requestHandler(jwt, { isProd: true, frontendApi: FRONTEND_API });
      await handler(requestInit);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(requestInit.url.searchParams.has('__clerk_db_jwt')).toBe(false);
    });

    test('appends auth header when JWT exists', async () => {
      const jwt = createMockJWTHandler('prod-token');
      const requestInit = createMockRequestInit();

      const handler = requestHandler(jwt, { isProd: true, frontendApi: FRONTEND_API });
      await handler(requestInit);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(requestInit.headers.get('Authorization')).toBe('Bearer prod-token');
    });
  });

  test('always sets credentials to omit', async () => {
    const jwt = createMockJWTHandler('token');
    const requestInit = createMockRequestInit();

    const handler = requestHandler(jwt, { isProd: false, frontendApi: FRONTEND_API });
    await handler(requestInit);

    expect(requestInit.credentials).toBe('omit');
  });
});
