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

  test('reloads when the app returns to the foreground while unsupported', async () => {
    const { createAppVersionRequestHooks } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const refresh = vi.fn().mockResolvedValue(undefined);
    hooks.refreshOnForegroundWhileUnsupported(refresh);

    appState.emit('active');
    expect(refresh).not.toHaveBeenCalled();

    const rejectedRequest = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(rejectedRequest);
    hooks.afterResponse(rejectedRequest, unsupportedAppVersion);
    appState.emit('background');
    appState.emit('active');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('stops reloading for a Clerk instance that was replaced', async () => {
    const { createAppVersionRequestHooks } = await loadModules();
    const staleRefresh = vi.fn().mockResolvedValue(undefined);
    createAppVersionRequestHooks().refreshOnForegroundWhileUnsupported(staleRefresh);
    const hooks = createAppVersionRequestHooks();
    const rejectedRequest = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(rejectedRequest);
    hooks.afterResponse(rejectedRequest, unsupportedAppVersion);

    appState.emit('active');

    expect(staleRefresh).not.toHaveBeenCalled();
  });
});
