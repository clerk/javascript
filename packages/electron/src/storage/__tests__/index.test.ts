import { safeStorage } from 'electron';
import Store from 'electron-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storage } from '../index';

const storeGet = vi.fn();
const storeSet = vi.fn();
const storeDelete = vi.fn();

vi.mock('electron', () => ({
  safeStorage: {
    decryptString: vi.fn(),
    encryptString: vi.fn(),
  },
}));

vi.mock('electron-store', () => ({
  default: vi.fn(() => ({
    get: storeGet,
    set: storeSet,
    delete: storeDelete,
  })),
}));

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an electron-store instance with the default store name', () => {
    storage();

    expect(Store).toHaveBeenCalledWith({ name: 'clerk-tokens' });
  });

  it('supports a custom store name', () => {
    storage({ name: 'custom-clerk-tokens' });

    expect(Store).toHaveBeenCalledWith({ name: 'custom-clerk-tokens' });
  });

  it('returns null when a token is missing', () => {
    storeGet.mockReturnValue(undefined);

    expect(storage().getItem('token-key')).toBeNull();
  });

  it('decrypts stored tokens', () => {
    storeGet.mockReturnValue(Buffer.from('encrypted-token').toString('base64'));
    vi.mocked(safeStorage.decryptString).mockReturnValue('jwt');

    expect(storage().getItem('token-key')).toBe('jwt');
    expect(safeStorage.decryptString).toHaveBeenCalledWith(Buffer.from('encrypted-token'));
  });

  it('returns null when token decryption fails', () => {
    storeGet.mockReturnValue(Buffer.from('encrypted-token').toString('base64'));
    vi.mocked(safeStorage.decryptString).mockImplementation(() => {
      throw new Error('decrypt failed');
    });

    expect(storage().getItem('token-key')).toBeNull();
  });

  it('encrypts tokens before storing them', async () => {
    vi.mocked(safeStorage.encryptString).mockReturnValue(Buffer.from('encrypted-token'));

    await storage().setItem('token-key', 'jwt');

    expect(safeStorage.encryptString).toHaveBeenCalledWith('jwt');
    expect(storeSet).toHaveBeenCalledWith('token-key', Buffer.from('encrypted-token').toString('base64'));
  });

  it('removes stored tokens', async () => {
    await storage().removeItem('token-key');

    expect(storeDelete).toHaveBeenCalledWith('token-key');
  });
});
