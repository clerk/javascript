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
