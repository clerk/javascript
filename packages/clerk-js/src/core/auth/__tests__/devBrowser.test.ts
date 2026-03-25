import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FapiClient } from '../../fapiClient';
import { createDevBrowser } from '../devBrowser';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

function mockFapiClient() {
  return {
    buildUrl: vi.fn(() => 'https://white-koala-42.clerk.accounts.dev/dev_browser'),
    onAfterResponse: vi.fn(),
    onBeforeRequest: vi.fn(),
  } as unknown as FapiClient;
}

const DEV_FRONTEND_API = 'white-koala-42.clerk.accounts.dev';
const COOKIE_SUFFIX = 'test-suffix';

function clearDevBrowserCookies() {
  document.cookie = `__clerk_db_jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  document.cookie = `__clerk_db_jwt_${COOKIE_SUFFIX}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

describe('Thrown errors', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = vi.fn(() =>
      Promise.resolve<RecursivePartial<Response>>({
        ok: false,
        json: () =>
          Promise.resolve({
            errors: [
              {
                message: 'URL-based session syncing is disabled for this instance',
                long_message:
                  'This is a development instance operating with legacy, third-party cookies. To enable URL-based session syncing refer to https://clerk.com/docs/upgrade-guides/url-based-session-syncing.',
                code: 'url_based_session_syncing_disabled',
              },
            ],
            clerk_trace_id: 'ff1048d1cb5a74da3ebd660877680ba3',
          }),
      }),
    );
  });

  afterEach(() => {
    // @ts-ignore
    vi.mocked(global.fetch)?.mockClear();
  });

  // Note: The test runs without any initial or mocked values on __clerk_db_jwt cookies.
  // It is expected to modify the test accordingly if cookies are mocked for future extra testing.
  it('throws any FAPI errors during dev browser creation', async () => {
    const devBrowserHandler = createDevBrowser({
      frontendApi: DEV_FRONTEND_API,
      fapiClient: mockFapiClient(),
      cookieSuffix: COOKIE_SUFFIX,
      cookieOptions: { usePartitionedCookies: () => false },
    });

    await expect(devBrowserHandler.setup()).rejects.toThrow(
      'ClerkJS: Something went wrong initializing Clerk in development mode. This is a development instance operating with legacy, third-party cookies. To enable URL-based session syncing refer to https://clerk.com/docs/upgrade-guides/url-based-session-syncing.',
    );
  });
});

describe('In-memory dev browser token', () => {
  afterEach(() => {
    // @ts-ignore
    vi.mocked(global.fetch)?.mockClear();
    clearDevBrowserCookies();
  });

  it('getDevBrowser returns in-memory value even when cookie is cleared', async () => {
    const devBrowserId = 'dev_browser_abc123';

    // @ts-ignore
    global.fetch = vi.fn(() =>
      Promise.resolve<RecursivePartial<Response>>({
        ok: true,
        json: () => Promise.resolve({ id: devBrowserId }),
      }),
    );

    const devBrowserHandler = createDevBrowser({
      frontendApi: DEV_FRONTEND_API,
      fapiClient: mockFapiClient(),
      cookieSuffix: COOKIE_SUFFIX,
      cookieOptions: { usePartitionedCookies: () => false },
    });

    await devBrowserHandler.setup();
    expect(devBrowserHandler.getDevBrowser()).toBe(devBrowserId);

    // Simulate cookie being unreadable (e.g. blocked in third-party context)
    clearDevBrowserCookies();

    // In-memory value survives cookie loss
    expect(devBrowserHandler.getDevBrowser()).toBe(devBrowserId);
  });

  it('refreshCookies uses in-memory value when cookie is gone', async () => {
    const devBrowserId = 'dev_browser_xyz789';

    // @ts-ignore
    global.fetch = vi.fn(() =>
      Promise.resolve<RecursivePartial<Response>>({
        ok: true,
        json: () => Promise.resolve({ id: devBrowserId }),
      }),
    );

    const devBrowserHandler = createDevBrowser({
      frontendApi: DEV_FRONTEND_API,
      fapiClient: mockFapiClient(),
      cookieSuffix: COOKIE_SUFFIX,
      cookieOptions: { usePartitionedCookies: () => false },
    });

    await devBrowserHandler.setup();

    // Wipe cookies to simulate failed initial write in third-party context
    clearDevBrowserCookies();

    // refreshCookies should still recover from the in-memory value
    devBrowserHandler.refreshCookies();
    expect(devBrowserHandler.getDevBrowser()).toBe(devBrowserId);
  });

  it('clear removes both in-memory value and cookie', () => {
    const devBrowserHandler = createDevBrowser({
      frontendApi: DEV_FRONTEND_API,
      fapiClient: mockFapiClient(),
      cookieSuffix: COOKIE_SUFFIX,
      cookieOptions: { usePartitionedCookies: () => false },
    });

    devBrowserHandler.setDevBrowser('dev_browser_token');
    expect(devBrowserHandler.getDevBrowser()).toBe('dev_browser_token');

    devBrowserHandler.clear();
    expect(devBrowserHandler.getDevBrowser()).toBeUndefined();
  });

  it('setDevBrowser updates in-memory value', () => {
    const devBrowserHandler = createDevBrowser({
      frontendApi: DEV_FRONTEND_API,
      fapiClient: mockFapiClient(),
      cookieSuffix: COOKIE_SUFFIX,
      cookieOptions: { usePartitionedCookies: () => false },
    });

    devBrowserHandler.setDevBrowser('token_1');
    expect(devBrowserHandler.getDevBrowser()).toBe('token_1');

    devBrowserHandler.setDevBrowser('token_2');
    expect(devBrowserHandler.getDevBrowser()).toBe('token_2');
  });
});

describe('Duplicate cookie from partitionedCookies transition', () => {
  afterEach(() => {
    // @ts-ignore
    vi.mocked(global.fetch)?.mockClear();
    clearDevBrowserCookies();
  });

  it('in-memory value takes precedence when cookie read returns stale non-partitioned duplicate', async () => {
    const initialToken = 'dev_browser_initial';
    const rotatedToken = 'dev_browser_rotated';

    // @ts-ignore
    global.fetch = vi.fn(() =>
      Promise.resolve<RecursivePartial<Response>>({
        ok: true,
        json: () => Promise.resolve({ id: initialToken }),
      }),
    );

    let afterResponseCb: (_: unknown, res: RecursivePartial<Response>) => void = () => {};
    const fapiClient = {
      ...mockFapiClient(),
      onAfterResponse: vi.fn((cb: typeof afterResponseCb) => {
        afterResponseCb = cb;
      }),
    } as unknown as FapiClient;

    let partitioned = false;
    const devBrowserHandler = createDevBrowser({
      frontendApi: DEV_FRONTEND_API,
      fapiClient,
      cookieSuffix: COOKIE_SUFFIX,
      cookieOptions: { usePartitionedCookies: () => partitioned },
    });

    // 1. Setup: POST /dev_browser returns initialToken, written as non-partitioned cookie
    await devBrowserHandler.setup();
    expect(devBrowserHandler.getDevBrowser()).toBe(initialToken);

    // 2. FAPI response rotates the token — both memory and cookie are updated
    afterResponseCb(null, {
      headers: new Headers({ 'Clerk-Db-Jwt': rotatedToken }),
    });
    expect(devBrowserHandler.getDevBrowser()).toBe(rotatedToken);

    // 3. Simulate the duplicate cookie problem: the browser has both a
    //    non-partitioned cookie (stale initialToken) and a partitioned cookie
    //    (rotatedToken). document.cookie returns the stale one first.
    //    We simulate this by writing the stale value back to the cookie.
    document.cookie = `__clerk_db_jwt=${initialToken}; path=/`;
    document.cookie = `__clerk_db_jwt_${COOKIE_SUFFIX}=${initialToken}; path=/`;

    // 4. Without in-memory, getDevBrowser() would read the stale cookie value.
    //    With in-memory, it returns the correct rotated token.
    expect(devBrowserHandler.getDevBrowser()).toBe(rotatedToken);

    // 5. Environment resolves with partitionedCookies: true, refreshCookies fires.
    //    It must use the in-memory rotatedToken, not the stale cookie value.
    partitioned = true;
    devBrowserHandler.refreshCookies();
    expect(devBrowserHandler.getDevBrowser()).toBe(rotatedToken);
  });

  it('FAPI interceptor attaches correct token despite stale cookie from duplicate', async () => {
    const initialToken = 'dev_browser_stale';
    const rotatedToken = 'dev_browser_fresh';

    // @ts-ignore
    global.fetch = vi.fn(() =>
      Promise.resolve<RecursivePartial<Response>>({
        ok: true,
        json: () => Promise.resolve({ id: initialToken }),
      }),
    );

    let beforeRequestCb: (req: { url?: URL }) => void = () => {};
    let afterResponseCb: (_: unknown, res: RecursivePartial<Response>) => void = () => {};
    const fapiClient = {
      ...mockFapiClient(),
      onBeforeRequest: vi.fn((cb: typeof beforeRequestCb) => {
        beforeRequestCb = cb;
      }),
      onAfterResponse: vi.fn((cb: typeof afterResponseCb) => {
        afterResponseCb = cb;
      }),
    } as unknown as FapiClient;

    let partitioned = false;
    const devBrowserHandler = createDevBrowser({
      frontendApi: DEV_FRONTEND_API,
      fapiClient,
      cookieSuffix: COOKIE_SUFFIX,
      cookieOptions: { usePartitionedCookies: () => partitioned },
    });

    // Setup writes initialToken as non-partitioned
    await devBrowserHandler.setup();

    // Token rotates via FAPI response
    afterResponseCb(null, {
      headers: new Headers({ 'Clerk-Db-Jwt': rotatedToken }),
    });

    // Simulate duplicate: stale non-partitioned cookie shadows the partitioned one
    document.cookie = `__clerk_db_jwt=${initialToken}; path=/`;
    document.cookie = `__clerk_db_jwt_${COOKIE_SUFFIX}=${initialToken}; path=/`;

    // FAPI interceptor must attach the rotated token, not the stale cookie
    const request = { url: new URL('https://white-koala-42.clerk.accounts.dev/v1/client') };
    beforeRequestCb(request);
    expect(request.url.searchParams.get('__clerk_db_jwt')).toBe(rotatedToken);

    // After Environment resolves and refreshCookies runs, still correct
    partitioned = true;
    devBrowserHandler.refreshCookies();

    const request2 = { url: new URL('https://white-koala-42.clerk.accounts.dev/v1/environment') };
    beforeRequestCb(request2);
    expect(request2.url.searchParams.get('__clerk_db_jwt')).toBe(rotatedToken);
  });
});
