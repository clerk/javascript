import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    platform: { OS: 'ios' as 'ios' | 'android' },
    appState: { currentState: 'active' as string | null },
    getItemAsync: vi.fn<(key: string, options?: unknown) => Promise<string | null>>(),
    deleteItemAsync: vi.fn<(key: string, options?: unknown) => Promise<void>>(),
    setItemAsync: vi.fn<(key: string, value: string, options?: unknown) => Promise<void>>(),
  };
});

vi.mock('react-native', () => {
  return {
    AppState: mocks.appState,
    Platform: mocks.platform,
  };
});

vi.mock('../../utils', async () => {
  const runtime = await vi.importActual<typeof import('../../utils/runtime')>('../../utils/runtime');
  return {
    isNative: () => true,
    isAppInBackgroundOrInactive: runtime.isAppInBackgroundOrInactive,
  };
});

vi.mock('expo-secure-store', () => {
  return {
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    getItemAsync: mocks.getItemAsync,
    deleteItemAsync: mocks.deleteItemAsync,
    setItemAsync: mocks.setItemAsync,
  };
});

const loadTokenCache = async () => {
  const mod = await import('../index');
  if (!mod.tokenCache) {
    throw new Error('Expected a native token cache');
  }
  return mod.tokenCache;
};

describe('tokenCache', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.platform.OS = 'ios';
    mocks.appState.currentState = 'active';
    mocks.deleteItemAsync.mockResolvedValue(undefined);
  });

  test('returns the stored token', async () => {
    mocks.getItemAsync.mockResolvedValue('client-jwt');
    const tokenCache = await loadTokenCache();

    await expect(tokenCache.getToken('__clerk_client_jwt')).resolves.toBe('client-jwt');
    expect(mocks.deleteItemAsync).not.toHaveBeenCalled();
  });

  test.each(['background', 'inactive', 'extension', 'unknown', null])(
    'keeps the stored token and rethrows when the keychain read fails on iOS while the app is %s',
    async appState => {
      const readError = new Error('User interaction is not allowed.');
      mocks.appState.currentState = appState;
      mocks.getItemAsync.mockRejectedValue(readError);
      const tokenCache = await loadTokenCache();

      await expect(tokenCache.getToken('__clerk_client_jwt')).rejects.toBe(readError);
      expect(mocks.deleteItemAsync).not.toHaveBeenCalled();
    },
  );

  test.each(['background', 'inactive', 'extension', 'unknown', null])(
    'keeps the stored token when a read started in %s fails after the app becomes active',
    async appState => {
      const readError = new Error('User interaction is not allowed.');
      mocks.appState.currentState = appState;
      let rejectRead: (error: Error) => void = () => {};
      mocks.getItemAsync.mockReturnValue(
        new Promise<string | null>((_, reject) => {
          rejectRead = reject;
        }),
      );
      const tokenCache = await loadTokenCache();

      const read = tokenCache.getToken('__clerk_client_jwt');
      mocks.appState.currentState = 'active';
      rejectRead(readError);

      await expect(read).rejects.toBe(readError);
      expect(mocks.deleteItemAsync).not.toHaveBeenCalled();
    },
  );

  test.each(['background', 'inactive', 'extension', 'unknown', null])(
    'keeps the stored token when an active read fails after the app becomes %s',
    async appState => {
      const readError = new Error('User interaction is not allowed.');
      mocks.appState.currentState = 'active';
      let rejectRead: (error: Error) => void = () => {};
      mocks.getItemAsync.mockReturnValue(
        new Promise<string | null>((_, reject) => {
          rejectRead = reject;
        }),
      );
      const tokenCache = await loadTokenCache();

      const read = tokenCache.getToken('__clerk_client_jwt');
      mocks.appState.currentState = appState;
      rejectRead(readError);

      await expect(read).rejects.toBe(readError);
      expect(mocks.deleteItemAsync).not.toHaveBeenCalled();
    },
  );

  test.each(['active'])(
    'removes an unreadable token when the read fails on iOS while the app state is %s',
    async appState => {
      mocks.appState.currentState = appState;
      mocks.getItemAsync.mockRejectedValue(new Error('Unable to decode the provided data.'));
      const tokenCache = await loadTokenCache();

      await expect(tokenCache.getToken('__clerk_client_jwt')).resolves.toBeNull();
      expect(mocks.deleteItemAsync).toHaveBeenCalledWith('__clerk_client_jwt', {
        keychainAccessible: 'AFTER_FIRST_UNLOCK',
      });
    },
  );

  test('removes an unreadable token when the read fails on Android, even in the background', async () => {
    mocks.platform.OS = 'android';
    mocks.appState.currentState = 'background';
    mocks.getItemAsync.mockRejectedValue(new Error('Could not decrypt the value'));
    const tokenCache = await loadTokenCache();

    await expect(tokenCache.getToken('__clerk_client_jwt')).resolves.toBeNull();
    expect(mocks.deleteItemAsync).toHaveBeenCalled();
  });
});
