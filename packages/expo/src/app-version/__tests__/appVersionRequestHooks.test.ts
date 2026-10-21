import { beforeEach, describe, expect, test, vi } from 'vitest';

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

    hooks.afterResponse(requestInit, response({ status: 403, payload: { errors: [{ code: 'user_banned' }] } }));

    expect(status().isSupported).toBe(true);
  });

  test('the supported header lifts a block', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const requestInit = { path: '/client', headers: new Headers() };
    hooks.afterResponse(requestInit, unsupportedAppVersion);

    hooks.afterResponse(requestInit, response({ headers: { 'X-Clerk-App-Version-Status': 'supported' } }));

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

  test('an environment that loads during a rejection keeps the block', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const hooks = createAppVersionRequestHooks();
    const environmentRequest = { path: '/environment', headers: new Headers() };
    const clientRequest = { path: '/client', headers: new Headers() };
    hooks.beforeRequest(environmentRequest);
    hooks.beforeRequest(clientRequest);

    hooks.afterResponse(clientRequest, unsupportedAppVersion);
    hooks.afterResponse(environmentRequest, response({ payload: { native_app_settings: {} } }));

    expect(status().isSupported).toBe(false);
  });

  test('ignores responses to a Clerk instance that was replaced', async () => {
    const { createAppVersionRequestHooks, status } = await loadModules();
    const staleHooks = createAppVersionRequestHooks();
    createAppVersionRequestHooks();

    staleHooks.afterResponse({ path: '/client', headers: new Headers() }, unsupportedAppVersion);

    expect(status().isSupported).toBe(true);
  });
});
