import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { TokenCache } from '../../cache/types';
import { CLERK_CLIENT_JWT_KEY } from '../../constants';
import type { ClerkExpoNativeModule } from '../../utils/native-module';

const mocks = vi.hoisted(() => {
  const listeners = new Set<(state: string) => void>();
  return {
    listeners,
    appState: {
      currentState: 'active' as string,
      addEventListener: (_event: string, listener: (state: string) => void) => {
        listeners.add(listener);
        return { remove: () => listeners.delete(listener) };
      },
    },
  };
});

vi.mock('react-native', () => ({ AppState: mocks.appState, Platform: { OS: 'ios' } }));

function nativeModule(): ClerkExpoNativeModule {
  return {
    configureNative: vi.fn().mockResolvedValue(undefined),
    getDeviceToken: vi.fn().mockResolvedValue('native-token'),
    setDeviceToken: vi.fn().mockResolvedValue(true),
    refreshClient: vi.fn().mockResolvedValue(undefined),
  };
}

function userTokenCache(getToken: TokenCache['getToken']): TokenCache {
  return { getToken, saveToken: vi.fn().mockResolvedValue(undefined) };
}

function storedTokenCache(clientToken: string): TokenCache {
  const stored: Record<string, string> = { [CLERK_CLIENT_JWT_KEY]: clientToken };
  return {
    getToken: key => Promise.resolve(stored[key] ?? null),
    saveToken: (key, token) => {
      stored[key] = token;
      return Promise.resolve();
    },
  };
}

async function loadEngine() {
  const { createNativeClientSync } = await import('../nativeClientSync');
  return createNativeClientSync;
}

describe('createNativeClientSync', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.appState.currentState = 'active';
    mocks.listeners.clear();
  });

  test('configures native with the proxy URL', async () => {
    const createNativeClientSync = await loadEngine();
    const native = nativeModule();
    const cache = userTokenCache(vi.fn().mockResolvedValue('seed-token'));

    const sync = createNativeClientSync(native, 'pk_test_123', 'https://example.com/__clerk', () => cache);

    await expect(sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY)).resolves.toBe('native-token');
    expect(native.configureNative).toHaveBeenCalledWith('pk_test_123', 'seed-token', 'https://example.com/__clerk');
  });

  test('tells native whether to show its update screen before configuring it', async () => {
    const createNativeClientSync = await loadEngine();
    const native = { ...nativeModule(), setUpdateRequiredViewEnabled: vi.fn().mockResolvedValue(undefined) };
    const cache = userTokenCache(vi.fn().mockResolvedValue(null));

    await createNativeClientSync(native, 'pk_test_123', null, () => cache, false).tokenCache.getToken(
      CLERK_CLIENT_JWT_KEY,
    );

    expect(native.setUpdateRequiredViewEnabled).toHaveBeenCalledWith(false);
    expect(vi.mocked(native.setUpdateRequiredViewEnabled).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(native.configureNative).mock.invocationCallOrder[0],
    );
  });

  test('leaves the native update screen on unless told otherwise', async () => {
    const createNativeClientSync = await loadEngine();
    const native = { ...nativeModule(), setUpdateRequiredViewEnabled: vi.fn().mockResolvedValue(undefined) };
    const cache = userTokenCache(vi.fn().mockResolvedValue(null));

    await createNativeClientSync(native, 'pk_test_123', null, () => cache).tokenCache.getToken(CLERK_CLIENT_JWT_KEY);

    expect(native.setUpdateRequiredViewEnabled).toHaveBeenCalledWith(true);
  });

  test('still configures native when setting its update screen fails', async () => {
    const createNativeClientSync = await loadEngine();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const native = {
      ...nativeModule(),
      setUpdateRequiredViewEnabled: vi.fn().mockRejectedValue(new Error('not available')),
    };
    const cache = userTokenCache(vi.fn().mockResolvedValue(null));

    await createNativeClientSync(native, 'pk_test_123', null, () => cache, false).tokenCache.getToken(
      CLERK_CLIENT_JWT_KEY,
    );

    expect(native.configureNative).toHaveBeenCalledWith('pk_test_123', null, null);
  });

  test('configures native again when the proxy URL changes', async () => {
    const createNativeClientSync = await loadEngine();
    const native = nativeModule();
    const cache = userTokenCache(vi.fn().mockResolvedValue(null));

    await createNativeClientSync(native, 'pk_test_123', null, () => cache).tokenCache.getToken(CLERK_CLIENT_JWT_KEY);
    await createNativeClientSync(native, 'pk_test_123', 'https://example.com/__clerk', () => cache).tokenCache.getToken(
      CLERK_CLIENT_JWT_KEY,
    );

    expect(native.configureNative).toHaveBeenNthCalledWith(1, 'pk_test_123', null, null);
    expect(native.configureNative).toHaveBeenNthCalledWith(2, 'pk_test_123', null, 'https://example.com/__clerk');
  });

  test('retries a configure that rejects once', async () => {
    const createNativeClientSync = await loadEngine();
    const native = nativeModule();
    vi.mocked(native.configureNative).mockRejectedValueOnce(new Error('keystore busy'));
    const cache = userTokenCache(vi.fn().mockResolvedValue('seed-token'));

    const sync = createNativeClientSync(native, 'pk_test_123', null, () => cache);

    await expect(sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY)).resolves.toBe('native-token');
    expect(native.configureNative).toHaveBeenCalledTimes(2);
  });

  test('uses the app token cache while a slow configure is pending and the native token once it finishes', async () => {
    vi.useFakeTimers();
    try {
      const createNativeClientSync = await loadEngine();
      const native = nativeModule();
      let finishConfigure!: () => void;
      vi.mocked(native.configureNative).mockReturnValue(new Promise<void>(resolve => (finishConfigure = resolve)));
      const cache = userTokenCache(vi.fn().mockResolvedValue('seed-token'));

      const sync = createNativeClientSync(native, 'pk_test_123', null, () => cache);
      const duringStartup = sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY);
      await vi.advanceTimersByTimeAsync(3_000);

      await expect(duringStartup).resolves.toBe('seed-token');
      expect(native.getDeviceToken).not.toHaveBeenCalled();

      finishConfigure();
      await vi.advanceTimersByTimeAsync(0);
      await expect(sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY)).resolves.toBe('native-token');
      expect(native.configureNative).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test('hands native a token rotated while a slow configure was pending', async () => {
    vi.useFakeTimers();
    try {
      const createNativeClientSync = await loadEngine();
      const native = nativeModule();
      let nativeToken: string | null = null;
      let finishConfigure!: () => void;
      vi.mocked(native.configureNative).mockImplementation(
        (_publishableKey, seed) =>
          new Promise<void>(resolve => {
            finishConfigure = () => {
              nativeToken ??= seed;
              resolve();
            };
          }),
      );
      vi.mocked(native.getDeviceToken).mockImplementation(() => Promise.resolve(nativeToken));
      vi.mocked(native.setDeviceToken).mockImplementation((token, expected) => {
        const didSet = nativeToken === expected;
        if (didSet) {
          nativeToken = token;
        }
        return Promise.resolve(didSet);
      });
      const cache = storedTokenCache('seed-token');

      const sync = createNativeClientSync(native, 'pk_test_123', null, () => cache);
      const duringStartup = sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY);
      await vi.advanceTimersByTimeAsync(3_000);
      await expect(duringStartup).resolves.toBe('seed-token');
      await sync.tokenCache.saveClientToken('signed-in-token', 'seed-token');

      finishConfigure();
      await vi.advanceTimersByTimeAsync(0);

      await expect(sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY)).resolves.toBe('signed-in-token');
      expect(native.setDeviceToken).toHaveBeenCalledWith('signed-in-token', 'seed-token');
      expect(native.refreshClient).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test('keeps the native token when native already had its own during a slow configure', async () => {
    vi.useFakeTimers();
    try {
      const createNativeClientSync = await loadEngine();
      const native = nativeModule();
      let finishConfigure!: () => void;
      vi.mocked(native.configureNative).mockReturnValue(new Promise<void>(resolve => (finishConfigure = resolve)));
      vi.mocked(native.setDeviceToken).mockResolvedValue(false);
      const cache = storedTokenCache('seed-token');

      const sync = createNativeClientSync(native, 'pk_test_123', null, () => cache);
      void sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY);
      await vi.advanceTimersByTimeAsync(3_000);
      await sync.tokenCache.saveClientToken('signed-in-token', 'seed-token');

      finishConfigure();
      await vi.advanceTimersByTimeAsync(0);

      await expect(sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY)).resolves.toBe('native-token');
      expect(native.refreshClient).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  test('waits for the app to become active and reads the seed again when the first read fails', async () => {
    const createNativeClientSync = await loadEngine();
    const native = nativeModule();
    const getToken = vi
      .fn<TokenCache['getToken']>()
      .mockRejectedValueOnce(new Error('keychain locked'))
      .mockResolvedValue('seed-token');
    mocks.appState.currentState = 'background';

    const sync = createNativeClientSync(native, 'pk_test_123', null, () => userTokenCache(getToken));
    const read = sync.tokenCache.getToken(CLERK_CLIENT_JWT_KEY);

    await vi.waitFor(() => expect(mocks.listeners.size).toBe(1));
    expect(native.configureNative).not.toHaveBeenCalled();

    mocks.appState.currentState = 'active';
    mocks.listeners.forEach(listener => listener('active'));

    await expect(read).resolves.toBe('native-token');
    expect(getToken).toHaveBeenCalledTimes(2);
    expect(native.configureNative).toHaveBeenCalledWith('pk_test_123', 'seed-token', null);
  });
});
