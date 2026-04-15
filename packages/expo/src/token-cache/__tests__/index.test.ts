import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
  isNative: true,
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: mocks.getItemAsync,
  setItemAsync: mocks.setItemAsync,
  deleteItemAsync: mocks.deleteItemAsync,
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
}));

vi.mock('../../utils', () => ({
  get isNative() {
    return () => mocks.isNative;
  },
}));

beforeEach(() => {
  vi.resetModules();
  mocks.getItemAsync.mockReset();
  mocks.setItemAsync.mockReset();
  mocks.deleteItemAsync.mockReset();
  mocks.isNative = true;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('tokenCache', () => {
  test('exports undefined on web', async () => {
    mocks.isNative = false;
    const { tokenCache } = await import('../index');
    expect(tokenCache).toBeUndefined();
  });

  test('exports a real cache on native', async () => {
    const { tokenCache } = await import('../index');
    expect(tokenCache).toBeDefined();
    expect(typeof tokenCache!.getToken).toBe('function');
    expect(typeof tokenCache!.saveToken).toBe('function');
  });

  test('getToken passes the key and AFTER_FIRST_UNLOCK option to SecureStore', async () => {
    mocks.getItemAsync.mockResolvedValueOnce('token_value');
    const { tokenCache } = await import('../index');
    await tokenCache!.getToken('clerk_session');
    expect(mocks.getItemAsync).toHaveBeenCalledWith('clerk_session', {
      keychainAccessible: 'AFTER_FIRST_UNLOCK',
    });
  });

  test('getToken returns the value from SecureStore', async () => {
    mocks.getItemAsync.mockResolvedValueOnce('the_token');
    const { tokenCache } = await import('../index');
    expect(await tokenCache!.getToken('k')).toBe('the_token');
  });

  test('getToken: when SecureStore.getItemAsync throws, it deletes the key and returns null', async () => {
    mocks.getItemAsync.mockRejectedValueOnce(new Error('decryption failed'));
    mocks.deleteItemAsync.mockResolvedValueOnce(undefined);
    const { tokenCache } = await import('../index');
    const result = await tokenCache!.getToken('corrupt_key');
    expect(result).toBeNull();
    expect(mocks.deleteItemAsync).toHaveBeenCalledWith('corrupt_key', {
      keychainAccessible: 'AFTER_FIRST_UNLOCK',
    });
  });

  test('saveToken passes key, value, and options to setItemAsync', async () => {
    mocks.setItemAsync.mockResolvedValueOnce(undefined);
    const { tokenCache } = await import('../index');
    await tokenCache!.saveToken('k', 'v');
    expect(mocks.setItemAsync).toHaveBeenCalledWith('k', 'v', {
      keychainAccessible: 'AFTER_FIRST_UNLOCK',
    });
  });

  test('saveToken returns the SecureStore promise', async () => {
    const expected = Promise.resolve();
    mocks.setItemAsync.mockReturnValueOnce(expected);
    const { tokenCache } = await import('../index');
    const got = tokenCache!.saveToken('k', 'v');
    expect(got).toBe(expected);
  });

  test('getToken returns null for a key that does not exist', async () => {
    mocks.getItemAsync.mockResolvedValueOnce(null);
    const { tokenCache } = await import('../index');
    expect(await tokenCache!.getToken('missing')).toBeNull();
  });
});
