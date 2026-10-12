import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    platform: { OS: 'ios' as 'ios' | 'android' },
    getItemAsync: vi.fn<(key: string, options?: unknown) => Promise<string | null>>(),
    deleteItemAsync: vi.fn<(key: string, options?: unknown) => Promise<void>>(),
    setItemAsync: vi.fn<(key: string, value: string, options?: unknown) => Promise<void>>(),
  };
});

vi.mock('react-native', () => {
  return {
    Platform: mocks.platform,
  };
});

vi.mock('../../utils', () => {
  return {
    isNative: () => true,
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
    mocks.deleteItemAsync.mockResolvedValue(undefined);
  });

  test('returns the stored token', async () => {
    mocks.getItemAsync.mockResolvedValue('client-jwt');
    const tokenCache = await loadTokenCache();

    await expect(tokenCache.getToken('__clerk_client_jwt')).resolves.toBe('client-jwt');
    expect(mocks.deleteItemAsync).not.toHaveBeenCalled();
  });

  test('keeps the stored token and rethrows when the keychain read fails on iOS', async () => {
    const readError = new Error('User interaction is not allowed.');
    mocks.getItemAsync.mockRejectedValue(readError);
    const tokenCache = await loadTokenCache();

    await expect(tokenCache.getToken('__clerk_client_jwt')).rejects.toBe(readError);
    expect(mocks.deleteItemAsync).not.toHaveBeenCalled();
  });

  test('removes an unreadable token when the read fails on Android', async () => {
    mocks.platform.OS = 'android';
    mocks.getItemAsync.mockRejectedValue(new Error('Could not decrypt the value'));
    const tokenCache = await loadTokenCache();

    await expect(tokenCache.getToken('__clerk_client_jwt')).resolves.toBeNull();
    expect(mocks.deleteItemAsync).toHaveBeenCalledWith('__clerk_client_jwt', {
      keychainAccessible: 'AFTER_FIRST_UNLOCK',
    });
  });
});
