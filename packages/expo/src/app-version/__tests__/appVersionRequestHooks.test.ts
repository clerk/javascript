import { beforeEach, describe, expect, test, vi } from 'vitest';

const appState = vi.hoisted(() => {
  const listeners = new Set<(state: string) => void>();
  return {
    listeners,
    addEventListener: (_type: string, listener: (state: string) => void) => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    },
    emit: (state: string) => listeners.forEach(listener => listener(state)),
  };
});

vi.mock('react-native', () => ({ AppState: { addEventListener: appState.addEventListener } }));

vi.mock('../nativeAppIdentity', () => ({
  getNativeAppIdentity: () => ({
    platform: 'ios',
    appIdentifier: 'com.example.app',
    version: '1.0',
    displayVersion: '1.0',
  }),
  getNativeAppPlatform: () => 'ios',
  isExpoApplicationInstalled: () => true,
  setNativeAppIdentityHeaders: (headers: Headers) => headers.set('x-bundle-id', 'com.example.app'),
}));

const BLOCKING_ENVIRONMENT = {
  native_app_settings: {
    minimum_supported_version: {
      ios: [{ bundle_id: 'com.example.app', minimum_version: '2.0', update_url: 'https://apps.apple.com/app/id1' }],
      android: [],
    },
  },
};

const response = ({
  status = 200,
  headers = {},
  payload = null,
}: {
  status?: number;
  headers?: Record<string, string>;
  payload?: unknown;
}) => ({ ok: status >= 200 && status < 300, status, headers: new Headers(headers), payload });

const unsupportedAppVersion = response({
  status: 403,
  payload: { errors: [{ code: 'unsupported_app_version', meta: { minimum_version: '2.0' } }] },
});

const loadModules = async () => {
  const hooks = await import('../appVersionRequestHooks');
  const store = await import('../appVersionSupport');
  return { createAppVersionRequestHooks: hooks.createAppVersionRequestHooks, status: store.getAppVersionSupportStatus };
};

describe('createAppVersionRequestHooks', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    appState.listeners.clear();
  });

  test('identifies the app on every request', async () => {
    const { createAppVersionRequestHooks } = await loadModules();
    const requestInit = { path: '/client', headers: new Headers() };

    createAppVersionRequestHooks().beforeRequest(requestInit);

    expect(requestInit.headers.get('x-bundle-id')).toBe('com.example.app');
  });

  test('blocks the app on an unsupported app version response', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const requestInit = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(requestInit);

    hooks.afterResponse(requestInit, unsupportedAppVersion);

    expect(status()).toMatchObject({ isSupported: false, minimumVersion: '2.0' });
  });

  test('leaves the app supported on another 403', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const requestInit = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(requestInit);

    hooks.afterResponse(requestInit, response({ status: 403, payload: { errors: [{ code: 'user_banned' }] } }));

    expect(status().isSupported).toBe(true);
  });

  test('the supported header lifts a block', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const rejectedRequest = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(rejectedRequest);
    hooks.afterResponse(rejectedRequest, unsupportedAppVersion);

    const laterRequest = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(laterRequest);
    hooks.afterResponse(laterRequest, response({ headers: { 'X-Clerk-App-Version-Status': 'supported' } }));

    expect(status().isSupported).toBe(true);
  });

  test('a rejection that arrives after a newer request was marked supported is ignored', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const olderRequest = { path: '/client', headers: new Headers() };
    const newerRequest = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(olderRequest);
    hooks.beforeRequest(newerRequest);

    hooks.afterResponse(newerRequest, response({ headers: { 'X-Clerk-App-Version-Status': 'supported' } }));
    hooks.afterResponse(olderRequest, unsupportedAppVersion);

    expect(status().isSupported).toBe(true);
  });

  test('a loaded environment blocks an outdated app', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const requestInit = { path: '/environment', headers: new Headers() };
    hooks.beforeRequest(requestInit);

    hooks.afterResponse(requestInit, response({ payload: BLOCKING_ENVIRONMENT }));

    expect(status()).toMatchObject({ isSupported: false, minimumVersion: '2.0' });
  });

  test('an environment that loads after a rejection keeps the block', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const environmentRequest = { path: '/environment', headers: new Headers() };
    const clientRequest = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(clientRequest);
    hooks.afterResponse(clientRequest, unsupportedAppVersion);

    hooks.beforeRequest(environmentRequest);
    hooks.afterResponse(environmentRequest, response({ payload: { native_app_settings: {} } }));

    expect(status().isSupported).toBe(false);
  });

  test('ignores responses to a Clerk instance that was replaced', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const staleHooks = createAppVersionRequestHooks();
    const staleRequest = { path: '/client', headers: new Headers() };
    staleHooks.beforeRequest(staleRequest);
    createAppVersionRequestHooks();

    staleHooks.afterResponse(staleRequest, unsupportedAppVersion);

    expect(status().isSupported).toBe(true);
  });

  const block = (hooks: ReturnType<Awaited<ReturnType<typeof loadModules>>['createAppVersionRequestHooks']>) => {
    const rejectedRequest = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(rejectedRequest);
    hooks.afterResponse(rejectedRequest, unsupportedAppVersion);
  };

  // Lets a check that already resolved finish, as the app does between two returns to the foreground.
  const settle = () => new Promise(resolve => setTimeout(resolve, 0));

  const foregroundAt = (now: number) => {
    vi.spyOn(Date, 'now').mockReturnValue(now);
    appState.emit('background');
    appState.emit('active');
  };

  test('reloads instead of checking when the app returns to the foreground while unsupported', async () => {
    const { createAppVersionRequestHooks } = await loadModules();
    vi.spyOn(Date, 'now').mockReturnValue(0);
    const hooks = createAppVersionRequestHooks();
    const reload = vi.fn().mockResolvedValue(undefined);
    const check = vi.fn().mockResolvedValue(undefined);
    hooks.checkOnForeground({ reload, check });
    block(hooks);

    foregroundAt(1_000);
    foregroundAt(2_000);

    expect(reload).toHaveBeenCalledTimes(2);
    expect(check).not.toHaveBeenCalled();
  });

  test('checks the app version on foreground at most every 30 seconds while supported', async () => {
    const { createAppVersionRequestHooks } = await loadModules();
    vi.spyOn(Date, 'now').mockReturnValue(0);
    const hooks = createAppVersionRequestHooks();
    const reload = vi.fn().mockResolvedValue(undefined);
    const check = vi.fn().mockResolvedValue(undefined);
    hooks.checkOnForeground({ reload, check });

    foregroundAt(10_000);
    expect(check).not.toHaveBeenCalled();

    foregroundAt(30_000);
    foregroundAt(45_000);
    expect(check).toHaveBeenCalledTimes(1);
    await settle();

    foregroundAt(60_000);
    expect(check).toHaveBeenCalledTimes(2);
    expect(reload).not.toHaveBeenCalled();
  });

  test('skips the foreground check while the previous one is still pending', async () => {
    const { createAppVersionRequestHooks } = await loadModules();
    vi.spyOn(Date, 'now').mockReturnValue(0);
    const hooks = createAppVersionRequestHooks();
    let finishCheck = () => {};
    const check = vi.fn(
      () =>
        new Promise<void>(resolve => {
          finishCheck = resolve;
        }),
    );
    hooks.checkOnForeground({ reload: vi.fn().mockResolvedValue(undefined), check });

    foregroundAt(30_000);
    foregroundAt(70_000);
    expect(check).toHaveBeenCalledTimes(1);

    finishCheck();
    await settle();
    foregroundAt(110_000);
    expect(check).toHaveBeenCalledTimes(2);
  });

  test('a foreground check that Clerk rejects blocks the app', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    vi.spyOn(Date, 'now').mockReturnValue(0);
    const hooks = createAppVersionRequestHooks();
    const check = vi.fn(() => {
      const checkRequest = { path: '/', headers: new Headers() };
      hooks.beforeRequest(checkRequest);
      hooks.afterResponse(checkRequest, unsupportedAppVersion);
      return Promise.resolve();
    });
    hooks.checkOnForeground({ reload: vi.fn().mockResolvedValue(undefined), check });

    foregroundAt(30_000);
    await vi.waitFor(() => expect(status().isSupported).toBe(false));
  });

  test('a foreground check that fails leaves the app supported', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    vi.spyOn(Date, 'now').mockReturnValue(0);
    const hooks = createAppVersionRequestHooks();
    const check = vi.fn().mockRejectedValue(new Error('Network request failed'));
    hooks.checkOnForeground({ reload: vi.fn().mockResolvedValue(undefined), check });

    foregroundAt(30_000);
    await Promise.resolve();

    expect(check).toHaveBeenCalledTimes(1);
    expect(status().isSupported).toBe(true);
  });

  test('stops checking for a Clerk instance that was replaced', async () => {
    const { createAppVersionRequestHooks } = await loadModules();
    vi.spyOn(Date, 'now').mockReturnValue(0);
    const staleReload = vi.fn().mockResolvedValue(undefined);
    const staleCheck = vi.fn().mockResolvedValue(undefined);
    createAppVersionRequestHooks().checkOnForeground({ reload: staleReload, check: staleCheck });
    const hooks = createAppVersionRequestHooks();
    block(hooks);

    foregroundAt(1_000);
    foregroundAt(60_000);

    expect(staleReload).not.toHaveBeenCalled();
    expect(staleCheck).not.toHaveBeenCalled();
  });
});
