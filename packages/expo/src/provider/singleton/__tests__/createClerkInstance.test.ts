import type { Clerk } from '@clerk/clerk-js';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { TokenCache } from '../../../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../../../constants';

const mocks = vi.hoisted(() => {
  return {
    constructorSpy: vi.fn(),
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

class MockClerk {
  public publishableKey: string;
  public proxyUrl: unknown;
  public domain: unknown;

  constructor(publishableKey: string, options?: { proxyUrl?: unknown; domain?: unknown }) {
    this.publishableKey = publishableKey;
    this.proxyUrl = options?.proxyUrl;
    this.domain = options?.domain;
    mocks.constructorSpy(publishableKey, options);
  }

  addListener = vi.fn();
  __internal_onBeforeRequest = vi.fn();
  __internal_onAfterResponse = vi.fn();
}

const loadCreateClerkInstance = async () => {
  const mod = await import('../createClerkInstance');
  return mod.createClerkInstance;
};

describe('createClerkInstance', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('passes proxyUrl to the native Clerk constructor', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });

    expect(mocks.constructorSpy).toHaveBeenCalledWith('pk_test_123', {
      proxyUrl: 'https://proxy.example.com/api/__clerk',
      domain: undefined,
    });
  });

  test('passes domain to the native Clerk constructor', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      domain: 'satellite.example.com',
    });

    expect(mocks.constructorSpy).toHaveBeenCalledWith('pk_test_123', {
      proxyUrl: undefined,
      domain: 'satellite.example.com',
    });
  });

  test('reuses the singleton when the config is unchanged', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    const first = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });
    const second = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });

    expect(first).toBe(second);
    expect(mocks.constructorSpy).toHaveBeenCalledTimes(1);
  });

  test('reuses the singleton when called without options after initialization', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    const first = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });
    const second = getClerkInstance();

    expect(first).toBe(second);
    expect(mocks.constructorSpy).toHaveBeenCalledTimes(1);
  });

  test('recreates the singleton when proxyUrl changes', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    const first = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy-a.example.com/api/__clerk',
    });
    const second = getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy-b.example.com/api/__clerk',
    });

    expect(first).not.toBe(second);
    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: 'https://proxy-b.example.com/api/__clerk',
      domain: undefined,
    });
  });

  test('preserves the existing publishable key when only proxyUrl changes', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy-a.example.com/api/__clerk',
    });
    getClerkInstance({
      proxyUrl: 'https://proxy-b.example.com/api/__clerk',
    });

    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: 'https://proxy-b.example.com/api/__clerk',
      domain: undefined,
    });
  });

  test('recreates the singleton when proxyUrl is explicitly removed', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
    });
    getClerkInstance({
      proxyUrl: undefined,
    });

    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: undefined,
      domain: undefined,
    });
  });

  test('does not carry proxy config across publishable key changes', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_old',
      proxyUrl: 'https://proxy.example.com/api/__clerk',
      domain: 'satellite.example.com',
    });
    getClerkInstance({
      publishableKey: 'pk_test_new',
    });

    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_new', {
      proxyUrl: undefined,
      domain: undefined,
    });
  });

  test('recreates the singleton when domain changes', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    const first = getClerkInstance({
      publishableKey: 'pk_test_123',
      domain: 'satellite-a.example.com',
    });
    const second = getClerkInstance({
      publishableKey: 'pk_test_123',
      domain: 'satellite-b.example.com',
    });

    expect(first).not.toBe(second);
    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: undefined,
      domain: 'satellite-b.example.com',
    });
  });

  test('recreates the singleton when domain is explicitly removed', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    getClerkInstance({
      publishableKey: 'pk_test_123',
      domain: 'satellite.example.com',
    });
    getClerkInstance({
      domain: undefined,
    });

    expect(mocks.constructorSpy).toHaveBeenNthCalledWith(2, 'pk_test_123', {
      proxyUrl: undefined,
      domain: undefined,
    });
  });

  test('throws when proxyUrl is not absolute', async () => {
    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);

    expect(() =>
      getClerkInstance({
        publishableKey: 'pk_test_123',
        proxyUrl: '/api/__clerk',
      }),
    ).toThrow(/`proxyUrl` must be an absolute URL/);

    expect(() =>
      getClerkInstance({
        publishableKey: 'pk_test_123',
        proxyUrl: () => '/api/__clerk',
      }),
    ).toThrow(/`proxyUrl` must be a string/);
  });

  test('preserves tokenCache method context for class instances', async () => {
    class InstanceTokenCache implements TokenCache {
      private readonly tokens = new Map<string, string>();

      getToken(key: string) {
        return Promise.resolve(this.tokens.get(key) ?? null);
      }

      saveToken(key: string, token: string) {
        this.tokens.set(key, token);
        return Promise.resolve();
      }
    }

    const tokenCache = new InstanceTokenCache();
    await tokenCache.saveToken(CLERK_CLIENT_JWT_KEY, 'cached-token');

    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);
    const clerk = getClerkInstance({
      publishableKey: 'pk_test_123',
      tokenCache,
    }) as unknown as MockClerk;

    const beforeRequest = clerk.__internal_onBeforeRequest.mock.calls[0][0];
    const requestInit = {
      headers: new Headers(),
      url: new URL('https://clerk.example.com/v1/client'),
    };
    await beforeRequest(requestInit);

    expect(requestInit.headers.get('authorization')).toBe('cached-token');

    const afterResponse = clerk.__internal_onAfterResponse.mock.calls[0][0];
    await afterResponse(requestInit, {
      headers: new Headers({ authorization: 'fresh-token' }),
      payload: null,
    });

    await expect(tokenCache.getToken(CLERK_CLIENT_JWT_KEY)).resolves.toBe('fresh-token');
  });

  test('uses the latest explicit tokenCache for request authorization when the singleton is reused', async () => {
    const initialTokenCache: TokenCache = {
      getToken: vi.fn(() => Promise.resolve(null)),
      saveToken: vi.fn(() => Promise.resolve()),
    };
    const latestTokenCache: TokenCache = {
      getToken: vi.fn(() => Promise.resolve('cached-token')),
      saveToken: vi.fn(() => Promise.resolve()),
    };

    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);
    const clerk = getClerkInstance({
      publishableKey: 'pk_test_123',
      tokenCache: initialTokenCache,
    }) as unknown as MockClerk;

    getClerkInstance({
      publishableKey: 'pk_test_123',
      tokenCache: latestTokenCache,
    });
    getClerkInstance();

    const beforeRequest = clerk.__internal_onBeforeRequest.mock.calls[0][0];
    const requestInit = {
      headers: new Headers(),
      url: new URL('https://clerk.example.com/v1/client'),
    };
    await beforeRequest(requestInit);

    expect(requestInit.headers.get('authorization')).toBe('cached-token');
  });

  test('preserves the latest tokenCache when the singleton is reused without one', async () => {
    const initialTokenCache: TokenCache = {
      getToken: vi.fn(() => Promise.resolve(null)),
      saveToken: vi.fn(() => Promise.resolve()),
    };
    const latestTokenCache: TokenCache = {
      getToken: vi.fn(() => Promise.resolve('cached-token')),
      saveToken: vi.fn(() => Promise.resolve()),
    };

    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);
    const clerk = getClerkInstance({
      publishableKey: 'pk_test_123',
      tokenCache: initialTokenCache,
    }) as unknown as MockClerk;

    getClerkInstance({
      publishableKey: 'pk_test_123',
      tokenCache: latestTokenCache,
    });
    getClerkInstance({ publishableKey: 'pk_test_123' });

    const beforeRequest = clerk.__internal_onBeforeRequest.mock.calls[0][0];
    const requestInit = {
      headers: new Headers(),
      url: new URL('https://clerk.example.com/v1/client'),
    };
    await beforeRequest(requestInit);

    expect(requestInit.headers.get('authorization')).toBe('cached-token');
  });

  test('uses the latest explicit tokenCache for response authorization when the singleton is reused', async () => {
    const initialTokenCache: TokenCache = {
      getToken: vi.fn(() => Promise.resolve(null)),
      saveToken: vi.fn(() => Promise.resolve()),
    };
    const latestTokenCache: TokenCache = {
      getToken: vi.fn(() => Promise.resolve(null)),
      saveToken: vi.fn(() => Promise.resolve()),
    };

    const createClerkInstance = await loadCreateClerkInstance();
    const getClerkInstance = createClerkInstance(MockClerk as unknown as typeof Clerk);
    const clerk = getClerkInstance({
      publishableKey: 'pk_test_123',
      tokenCache: initialTokenCache,
    }) as unknown as MockClerk;

    getClerkInstance({
      publishableKey: 'pk_test_123',
      tokenCache: latestTokenCache,
    });

    const afterResponse = clerk.__internal_onAfterResponse.mock.calls[0][0];
    await afterResponse(
      {
        headers: new Headers(),
        url: new URL('https://clerk.example.com/v1/client'),
      },
      {
        headers: new Headers({ authorization: 'fresh-token' }),
        payload: null,
      },
    );

    expect(initialTokenCache.saveToken).not.toHaveBeenCalled();
    expect(latestTokenCache.saveToken).toHaveBeenCalledWith(CLERK_CLIENT_JWT_KEY, 'fresh-token');
  });
});
