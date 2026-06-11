import type { BrowserContext, Request, Route } from '@playwright/test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_MISSING_FRONTEND_API_URL } from '../../common/errors';

// We need to reset the module-level WeakSet between tests
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let setupClerkTestingToken: (typeof import('../setupClerkTestingToken'))['setupClerkTestingToken'];

function createMockRoute(
  overrides: { url?: string; fetchStatus?: number; fetchJson?: unknown; fetchError?: Error } = {},
) {
  const {
    url = 'https://clerk.example.com/v1/client',
    fetchStatus = 200,
    fetchJson = { response: { captcha_bypass: false } },
    fetchError,
  } = overrides;

  const fulfilled: { response?: unknown; json: Record<string, any> }[] = [];
  const continued: { url?: string }[] = [];
  let fetchCallCount = 0;

  const route: Route = {
    request: () =>
      ({
        url: () => url,
      }) as unknown as Request,
    fetch: vi.fn(() => {
      fetchCallCount++;
      if (fetchError) {
        return Promise.reject(fetchError);
      }
      return Promise.resolve({
        status: () => fetchStatus,
        json: () => Promise.resolve(JSON.parse(JSON.stringify(fetchJson))),
      });
    }),
    fulfill: vi.fn((opts: any) => {
      fulfilled.push(opts);
      return Promise.resolve();
    }),
    continue: vi.fn(() => Promise.resolve()),
  } as unknown as Route;

  return { route, fulfilled, continued, getFetchCallCount: () => fetchCallCount };
}

function createMockContext() {
  const registrations: { pattern: RegExp; handler: (route: Route) => Promise<void> }[] = [];

  const context = {
    route: vi.fn((pattern: RegExp, handler: (route: Route) => Promise<void>) => {
      registrations.push({ pattern, handler });
      return Promise.resolve();
    }),
  } as unknown as BrowserContext;

  return {
    context,
    getRouteHandler: () => registrations.at(-1)?.handler,
    getRegistrations: () => registrations,
    getRouteCallCount: () => (context.route as ReturnType<typeof vi.fn>).mock.calls.length,
  };
}

describe('setupClerkTestingToken', () => {
  const FAPI_URL = 'clerk.example.com';
  const TESTING_TOKEN = 'test_token_123';

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.stubEnv('CLERK_FAPI', FAPI_URL);
    vi.stubEnv('CLERK_TESTING_TOKEN', TESTING_TOKEN);

    // Reset module to clear the WeakSet between tests
    vi.resetModules();
    const mod = await import('../setupClerkTestingToken.js');
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

    it('allows retry after route registration fails', async () => {
      const routeFn = vi.fn();
      routeFn.mockRejectedValueOnce(new Error('context closed'));
      routeFn.mockResolvedValueOnce(undefined);

      const context = { route: routeFn } as unknown as BrowserContext;

      await expect(setupClerkTestingToken({ context })).rejects.toThrow('context closed');
      await setupClerkTestingToken({ context });

      expect(routeFn).toHaveBeenCalledTimes(2);
    });

    it('rolls back only the failed host, keeping other hosts registered', async () => {
      const routeFn = vi.fn();
      routeFn.mockResolvedValueOnce(undefined);
      routeFn.mockRejectedValueOnce(new Error('context closed'));
      routeFn.mockResolvedValueOnce(undefined);

      const context = { route: routeFn } as unknown as BrowserContext;

      await setupClerkTestingToken({ context, options: { frontendApiUrl: 'a.clerk.com' } });
      await expect(setupClerkTestingToken({ context, options: { frontendApiUrl: 'b.clerk.com' } })).rejects.toThrow(
        'context closed',
      );
      // The failed host can retry; the successful host stays deduped.
      await setupClerkTestingToken({ context, options: { frontendApiUrl: 'b.clerk.com' } });
      await setupClerkTestingToken({ context, options: { frontendApiUrl: 'a.clerk.com' } });

      expect(routeFn).toHaveBeenCalledTimes(3);
    });

    it('resolves context from page when context is not provided', async () => {
      const { context, getRouteCallCount } = createMockContext();
      const page = { context: () => context } as any;

      await setupClerkTestingToken({ page });
      await setupClerkTestingToken({ page });

      expect(getRouteCallCount()).toBe(1);
    });

    it('no-ops on a second call with the same explicit frontendApiUrl', async () => {
      const { context, getRouteCallCount } = createMockContext();

      await setupClerkTestingToken({ context, options: { frontendApiUrl: 'a.clerk.com' } });
      await setupClerkTestingToken({ context, options: { frontendApiUrl: 'a.clerk.com' } });

      expect(getRouteCallCount()).toBe(1);
    });

    it('registers an additional route for a different frontendApiUrl on the same context', async () => {
      const { context, getRegistrations } = createMockContext();

      await setupClerkTestingToken({ context, options: { frontendApiUrl: 'a.clerk.com' } });
      await setupClerkTestingToken({ context, options: { frontendApiUrl: 'b.clerk.com' } });

      const registrations = getRegistrations();
      expect(registrations).toHaveLength(2);
      expect(registrations[0].pattern.test('https://a.clerk.com/v1/client')).toBe(true);
      expect(registrations[0].pattern.test('https://b.clerk.com/v1/client')).toBe(false);
      expect(registrations[1].pattern.test('https://b.clerk.com/v1/client')).toBe(true);
      expect(registrations[1].pattern.test('https://a.clerk.com/v1/client')).toBe(false);
    });
  });

  describe('per-instance testing tokens', () => {
    it('uses options.testingToken string over the env var', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context, options: { testingToken: 'option_token' } });

      const { route } = createMockRoute();
      await getRouteHandler()!(route);

      expect(route.fetch).toHaveBeenCalledWith({
        url: expect.stringContaining('__clerk_testing_token=option_token'),
      });
    });

    it('resolves an async testing token provider', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context, options: { testingToken: () => Promise.resolve('provider_token') } });

      const { route } = createMockRoute();
      await getRouteHandler()!(route);

      expect(route.fetch).toHaveBeenCalledWith({
        url: expect.stringContaining('__clerk_testing_token=provider_token'),
      });
    });

    it('invokes the provider once per registration across multiple requests', async () => {
      const { context, getRouteHandler } = createMockContext();
      const provider = vi.fn(() => Promise.resolve('provider_token'));
      await setupClerkTestingToken({ context, options: { testingToken: provider } });

      const handler = getRouteHandler()!;
      await handler(createMockRoute().route);
      await handler(createMockRoute().route);

      expect(provider).toHaveBeenCalledTimes(1);
    });

    it('falls back to the env var and warns when the provider rejects', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({
        context,
        options: { testingToken: () => Promise.reject(new Error('mint failed')) },
      });

      const { route, fulfilled } = createMockRoute();
      await getRouteHandler()!(route);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to resolve the testing token'),
        expect.any(Error),
      );
      expect(route.fetch).toHaveBeenCalledWith({
        url: expect.stringContaining(`__clerk_testing_token=${TESTING_TOKEN}`),
      });
      expect(fulfilled[0].json.response.captcha_bypass).toBe(true);

      warnSpy.mockRestore();
    });

    it('falls back to the env var when the provider resolves undefined', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context, options: { testingToken: () => undefined } });

      const { route } = createMockRoute();
      await getRouteHandler()!(route);

      expect(route.fetch).toHaveBeenCalledWith({
        url: expect.stringContaining(`__clerk_testing_token=${TESTING_TOKEN}`),
      });
    });

    it('appends each registration its own token when two instances share a context', async () => {
      const { context, getRegistrations } = createMockContext();

      await setupClerkTestingToken({
        context,
        options: { frontendApiUrl: 'a.clerk.com', testingToken: 'token_a' },
      });
      await setupClerkTestingToken({
        context,
        options: { frontendApiUrl: 'b.clerk.com', testingToken: () => Promise.resolve('token_b') },
      });

      const [first, second] = getRegistrations();

      const routeA = createMockRoute({ url: 'https://a.clerk.com/v1/client' });
      await first.handler(routeA.route);
      expect(routeA.route.fetch).toHaveBeenCalledWith({
        url: expect.stringContaining('__clerk_testing_token=token_a'),
      });

      const routeB = createMockRoute({ url: 'https://b.clerk.com/v1/client' });
      await second.handler(routeB.route);
      expect(routeB.route.fetch).toHaveBeenCalledWith({
        url: expect.stringContaining('__clerk_testing_token=token_b'),
      });
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
        fetch: vi.fn(() => {
          callCount++;
          if (callCount <= 2) {
            return Promise.resolve({ status: () => 429, json: () => Promise.resolve({}) });
          }
          return Promise.resolve({
            status: () => 200,
            json: () => Promise.resolve({ response: { captcha_bypass: false } }),
          });
        }),
        fulfill: vi.fn(() => Promise.resolve()),
        continue: vi.fn(() => Promise.resolve()),
      } as unknown as Route;

      const handlerPromise = getRouteHandler()!(route);
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
        fetch: vi.fn(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ status: () => status, json: () => Promise.resolve({}) });
          }
          return Promise.resolve({
            status: () => 200,
            json: () => Promise.resolve({ response: { captcha_bypass: false } }),
          });
        }),
        fulfill: vi.fn(() => Promise.resolve()),
        continue: vi.fn(() => Promise.resolve()),
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
        fetch: vi.fn(() =>
          Promise.resolve({
            status: () => 429,
            json: () => Promise.resolve({}),
          }),
        ),
        fulfill: vi.fn(() => Promise.resolve()),
        continue: vi.fn(() => Promise.resolve()),
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
        fetch: vi.fn(() => Promise.reject(networkError)),
        fulfill: vi.fn(() => Promise.resolve()),
        continue: vi.fn(() => Promise.resolve()),
      } as unknown as Route;

      const handlerPromise = getRouteHandler()!(route);
      await vi.advanceTimersByTimeAsync(60_000);
      await handlerPromise;

      expect(route.fetch).toHaveBeenCalledTimes(4);
      expect(route.continue).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('failed after 4 attempts'), networkError);

      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('recovers after transient error on retry', async () => {
      const { context, getRouteHandler } = createMockContext();
      await setupClerkTestingToken({ context });

      let callCount = 0;
      const route = {
        request: () => ({ url: () => 'https://clerk.example.com/v1/client' }),
        fetch: vi.fn(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(new Error('network error'));
          }
          return Promise.resolve({
            status: () => 200,
            json: () => Promise.resolve({ response: { captcha_bypass: false } }),
          });
        }),
        fulfill: vi.fn(() => Promise.resolve()),
        continue: vi.fn(() => Promise.resolve()),
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
