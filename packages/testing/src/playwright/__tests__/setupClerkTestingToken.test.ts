import type { BrowserContext, Request, Route } from '@playwright/test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_MISSING_FRONTEND_API_URL } from '../../common/errors';

// We need to reset the module-level WeakSet between tests
let setupClerkTestingToken: typeof import('../setupClerkTestingToken').setupClerkTestingToken;

function createMockRoute(overrides: { url?: string; fetchStatus?: number; fetchJson?: unknown; fetchError?: Error } = {}) {
  const {
    url = 'https://clerk.example.com/v1/client',
    fetchStatus = 200,
    fetchJson = { response: { captcha_bypass: false } },
    fetchError,
  } = overrides;

  const fulfilled: { response?: unknown; json?: unknown }[] = [];
  const continued: { url?: string }[] = [];
  let fetchCallCount = 0;

  const route: Route = {
    request: () =>
      ({
        url: () => url,
      }) as unknown as Request,
    fetch: vi.fn(async () => {
      fetchCallCount++;
      if (fetchError) {
        throw fetchError;
      }
      return {
        status: () => fetchStatus,
        json: async () => JSON.parse(JSON.stringify(fetchJson)),
      };
    }),
    fulfill: vi.fn(async (opts: any) => {
      fulfilled.push(opts);
    }),
    continue: vi.fn(async () => {}),
  } as unknown as Route;

  return { route, fulfilled, continued, getFetchCallCount: () => fetchCallCount };
}

function createMockContext() {
  let routeHandler: ((route: Route) => Promise<void>) | undefined;

  const context = {
    route: vi.fn(async (_pattern: RegExp, handler: (route: Route) => Promise<void>) => {
      routeHandler = handler;
    }),
  } as unknown as BrowserContext;

  return {
    context,
    getRouteHandler: () => routeHandler,
    getRouteCallCount: () => (context.route as ReturnType<typeof vi.fn>).mock.calls.length,
  };
}

describe('setupClerkTestingToken', () => {
  const FAPI_URL = 'clerk.example.com';
  const TESTING_TOKEN = 'test_token_123';

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubEnv('CLERK_FAPI', FAPI_URL);
    vi.stubEnv('CLERK_TESTING_TOKEN', TESTING_TOKEN);

    // Reset module to clear the WeakSet between tests
    vi.resetModules();
    const mod = await import('../setupClerkTestingToken');
    setupClerkTestingToken = mod.setupClerkTestingToken;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe('validation', () => {
    it('throws when neither context nor page is provided', async () => {
      await expect(setupClerkTestingToken({} as any)).rejects.toThrow(
        'Either context or page must be provided to setup testing token',
      );
    });

    it('throws when CLERK_FAPI is not set', async () => {
      vi.stubEnv('CLERK_FAPI', '');
      const { context } = createMockContext();
      await expect(setupClerkTestingToken({ context })).rejects.toThrow(ERROR_MISSING_FRONTEND_API_URL);
    });

    it('uses frontendApiUrl option over env var', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context, options: { frontendApiUrl: 'custom.clerk.com' } });

      const handler = getRouteHandler();
      expect(handler).toBeDefined();

      const { route, fulfilled } = createMockRoute({ url: 'https://custom.clerk.com/v1/client' });
      await handler!(route);

      expect(route.fetch).toHaveBeenCalledWith({
        url: expect.stringContaining('custom.clerk.com'),
      });
      expect(fulfilled).toHaveLength(1);
    });
  });

  describe('de-duplication', () => {
    it('registers route handler only once per context', async () => {
      const { context, getRouteCallCount } = createMockContext();

      await setupClerkTestingToken({ context });
      await setupClerkTestingToken({ context });
      await setupClerkTestingToken({ context });

      expect(getRouteCallCount()).toBe(1);
    });

    it('registers separate handlers for different contexts', async () => {
      const ctx1 = createMockContext();
      const ctx2 = createMockContext();

      await setupClerkTestingToken({ context: ctx1.context });
      await setupClerkTestingToken({ context: ctx2.context });

      expect(ctx1.getRouteCallCount()).toBe(1);
      expect(ctx2.getRouteCallCount()).toBe(1);
    });

    it('resolves context from page when context is not provided', async () => {
      const { context, getRouteCallCount } = createMockContext();
      const page = { context: () => context } as any;

      await setupClerkTestingToken({ page });
      await setupClerkTestingToken({ page });

      expect(getRouteCallCount()).toBe(1);
    });
  });

  describe('route handler', () => {
    it('appends testing token to FAPI requests', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      const { route } = createMockRoute();
      await getRouteHandler()!(route);

      expect(route.fetch).toHaveBeenCalledWith({
        url: expect.stringContaining(`__clerk_testing_token=${TESTING_TOKEN}`),
      });
    });

    it('overrides captcha_bypass in response', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      const { route, fulfilled } = createMockRoute({
        fetchJson: { response: { captcha_bypass: false } },
      });
      await getRouteHandler()!(route);

      expect(fulfilled).toHaveLength(1);
      expect(fulfilled[0].json.response.captcha_bypass).toBe(true);
    });

    it('overrides captcha_bypass in piggybacking response', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      const { route, fulfilled } = createMockRoute({
        fetchJson: { client: { captcha_bypass: false } },
      });
      await getRouteHandler()!(route);

      expect(fulfilled).toHaveLength(1);
      expect(fulfilled[0].json.client.captcha_bypass).toBe(true);
    });

    it('does not modify captcha_bypass when already true', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      const { route, fulfilled } = createMockRoute({
        fetchJson: { response: { captcha_bypass: true } },
      });
      await getRouteHandler()!(route);

      expect(fulfilled[0].json.response.captcha_bypass).toBe(true);
    });
  });

  describe('retry on transient errors', () => {
    it('retries on 429 status', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      let callCount = 0;
      const route = {
        request: () => ({ url: () => 'https://clerk.example.com/v1/client' }),
        fetch: vi.fn(async () => {
          callCount++;
          if (callCount <= 2) {
            return { status: () => 429, json: async () => ({}) };
          }
          return {
            status: () => 200,
            json: async () => ({ response: { captcha_bypass: false } }),
          };
        }),
        fulfill: vi.fn(),
        continue: vi.fn(),
      } as unknown as Route;

      const handlerPromise = getRouteHandler()!(route);
      // Advance through retry delays
      await vi.advanceTimersByTimeAsync(60_000);
      await handlerPromise;

      expect(callCount).toBe(3);
      expect(route.fulfill).toHaveBeenCalledTimes(1);
    });

    it.each([502, 503, 504])('retries on %d status', async status => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      let callCount = 0;
      const route = {
        request: () => ({ url: () => 'https://clerk.example.com/v1/client' }),
        fetch: vi.fn(async () => {
          callCount++;
          if (callCount === 1) {
            return { status: () => status, json: async () => ({}) };
          }
          return {
            status: () => 200,
            json: async () => ({ response: { captcha_bypass: false } }),
          };
        }),
        fulfill: vi.fn(),
        continue: vi.fn(),
      } as unknown as Route;

      const handlerPromise = getRouteHandler()!(route);
      await vi.advanceTimersByTimeAsync(60_000);
      await handlerPromise;

      expect(callCount).toBe(2);
      expect(route.fulfill).toHaveBeenCalledTimes(1);
    });

    it('does not retry on non-retryable status codes', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      const { route, fulfilled, getFetchCallCount } = createMockRoute({ fetchStatus: 401 });
      await getRouteHandler()!(route);

      expect(getFetchCallCount()).toBe(1);
      expect(fulfilled).toHaveLength(1);
    });

    it('fulfills with raw response after exhausting retries on retryable status', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const route = {
        request: () => ({ url: () => 'https://clerk.example.com/v1/client' }),
        fetch: vi.fn(async () => ({
          status: () => 429,
          json: async () => ({}),
        })),
        fulfill: vi.fn(),
        continue: vi.fn(),
      } as unknown as Route;

      const handlerPromise = getRouteHandler()!(route);
      await vi.advanceTimersByTimeAsync(60_000);
      await handlerPromise;

      // 1 initial + 3 retries = 4 total
      expect(route.fetch).toHaveBeenCalledTimes(4);
      expect(route.fulfill).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('failed with status 429 after 4 attempts'));

      warnSpy.mockRestore();
    });

    it('retries on thrown errors and warns after exhausting retries', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const networkError = new Error('net::ERR_CONNECTION_REFUSED');
      const route = {
        request: () => ({ url: () => 'https://clerk.example.com/v1/client' }),
        fetch: vi.fn(async () => {
          throw networkError;
        }),
        fulfill: vi.fn(async () => {}),
        continue: vi.fn(async () => {}),
      } as unknown as Route;

      const handlerPromise = getRouteHandler()!(route);
      await vi.advanceTimersByTimeAsync(60_000);
      await handlerPromise;

      expect(route.fetch).toHaveBeenCalledTimes(4);
      expect(route.continue).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('failed after 4 attempts'),
        networkError,
      );

      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('recovers after transient error on retry', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      let callCount = 0;
      const route = {
        request: () => ({ url: () => 'https://clerk.example.com/v1/client' }),
        fetch: vi.fn(async () => {
          callCount++;
          if (callCount === 1) {
            throw new Error('network error');
          }
          return {
            status: () => 200,
            json: async () => ({ response: { captcha_bypass: false } }),
          };
        }),
        fulfill: vi.fn(),
        continue: vi.fn(),
      } as unknown as Route;

      const handlerPromise = getRouteHandler()!(route);
      await vi.advanceTimersByTimeAsync(60_000);
      await handlerPromise;

      expect(callCount).toBe(2);
      expect(route.fulfill).toHaveBeenCalledTimes(1);
      expect(route.continue).not.toHaveBeenCalled();
    });
  });
});
