import { safeStorage } from 'electron';
import Store from 'electron-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storage } from '../index';

const storeGet = vi.fn();
const storeSet = vi.fn();
const storeDelete = vi.fn();

type AsyncSafeStorage = {
  encryptStringAsync: (value: string) => Promise<Buffer>;
  decryptStringAsync: (encrypted: Buffer) => Promise<{ result: string; shouldReEncrypt: boolean }>;
  isAsyncEncryptionAvailable: () => Promise<boolean>;
};

// `safeStorage` starts empty; each test installs only the methods for the backend it exercises.
// This mirrors reality: Electron < 42 has no async methods at all, so `resolveCipher` only takes the
// async path when both the methods exist and `isAsyncEncryptionAvailable()` confirms it.
vi.mock('electron', () => ({
  safeStorage: {},
}));

vi.mock('electron-store', () => ({
  default: vi.fn(function () {
    return {
      get: storeGet,
      set: storeSet,
      delete: storeDelete,
    };
  }),
}));

const ss = safeStorage as unknown as Record<string, unknown>;
const asyncSafeStorage = safeStorage as typeof safeStorage & AsyncSafeStorage;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, reject, resolve };
}

/** Installs the synchronous `safeStorage` API. */
function installSync({ available = true }: { available?: boolean } = {}) {
  ss.isEncryptionAvailable = vi.fn(() => available);
  ss.encryptString = vi.fn((value: string) => Buffer.from(`enc(${value})`));
  ss.decryptString = vi.fn();
}

/** Adds the Electron 42+ asynchronous `safeStorage` API. */
function installAsync({ available = true }: { available?: boolean } = {}) {
  ss.isAsyncEncryptionAvailable = vi.fn(() => Promise.resolve(available));
  ss.encryptStringAsync = vi.fn((value: string) => Promise.resolve(Buffer.from(`enc(${value})`)));
  ss.decryptStringAsync = vi.fn();
}

beforeEach(() => {
  vi.clearAllMocks();
  // Reset the mocked `safeStorage` shape so backend detection starts from a clean slate.
  for (const key of Object.keys(ss)) {
    delete ss[key];
  }
});

describe('storage options', () => {
  beforeEach(() => installSync());

  it('creates an electron-store instance with the default store name', () => {
    storage();

    expect(Store).toHaveBeenCalledWith({ name: 'clerk-tokens' });
  });

  it('supports a custom store name', () => {
    storage({ name: 'custom-clerk-tokens' });

    expect(Store).toHaveBeenCalledWith({ name: 'custom-clerk-tokens' });
  });

  it('forwards a custom path as electron-store `cwd`', () => {
    storage({ path: '/tmp/clerk' });

    expect(Store).toHaveBeenCalledWith({ name: 'clerk-tokens', cwd: '/tmp/clerk' });
  });

  it('omits `cwd` when no path is provided', () => {
    storage();

    expect(Store).toHaveBeenCalledWith(expect.not.objectContaining({ cwd: expect.anything() }));
  });
});

describe('getItem', () => {
  it('returns null when a token is missing', async () => {
    installSync();
    storeGet.mockReturnValue(undefined);

    await expect(storage().getItem('token-key')).resolves.toBeNull();
  });

  it('returns an unencrypted (raw:) value as-is without decrypting', async () => {
    installSync();
    storeGet.mockReturnValue('raw:jwt');

    await expect(storage().getItem('token-key')).resolves.toBe('jwt');
    expect(safeStorage.decryptString).not.toHaveBeenCalled();
  });

  it('deletes and returns null for an unrecognized value format', async () => {
    installSync();
    storeGet.mockReturnValue('garbage-without-prefix');

    await expect(storage().getItem('token-key')).resolves.toBeNull();
    expect(storeDelete).toHaveBeenCalledWith('token-key');
  });

  it('preserves the entry and returns null when no OS encryption is available', async () => {
    installSync({ available: false });
    storeGet.mockReturnValue(`enc:${Buffer.from('cipher').toString('base64')}`);

    await expect(storage().getItem('token-key')).resolves.toBeNull();
    expect(storeDelete).not.toHaveBeenCalled();
  });

  describe('sync backend', () => {
    it('decrypts stored tokens', async () => {
      installSync();
      storeGet.mockReturnValue(`enc:${Buffer.from('cipher').toString('base64')}`);
      vi.mocked(safeStorage.decryptString).mockReturnValue('jwt');

      await expect(storage().getItem('token-key')).resolves.toBe('jwt');
      expect(safeStorage.decryptString).toHaveBeenCalledWith(Buffer.from('cipher'));
    });

    it('returns null without deleting the entry when decryption fails', async () => {
      installSync();
      storeGet.mockReturnValue(`enc:${Buffer.from('cipher').toString('base64')}`);
      vi.mocked(safeStorage.decryptString).mockImplementation(() => {
        throw new Error('decrypt failed');
      });

      await expect(storage().getItem('token-key')).resolves.toBeNull();
      expect(storeDelete).not.toHaveBeenCalled();
    });
  });

  describe('async backend', () => {
    it('decrypts stored tokens', async () => {
      installSync();
      installAsync();
      storeGet.mockReturnValue(`enc:${Buffer.from('cipher').toString('base64')}`);
      vi.mocked(asyncSafeStorage.decryptStringAsync).mockResolvedValue({ result: 'jwt', shouldReEncrypt: false });

      await expect(storage().getItem('token-key')).resolves.toBe('jwt');
      expect(asyncSafeStorage.decryptStringAsync).toHaveBeenCalledWith(Buffer.from('cipher'));
    });

    it('re-encrypts and re-saves when the OS key has rotated (shouldReEncrypt)', async () => {
      installSync();
      installAsync();
      storeGet.mockReturnValue(`enc:${Buffer.from('old-cipher').toString('base64')}`);
      vi.mocked(asyncSafeStorage.decryptStringAsync).mockResolvedValue({ result: 'jwt', shouldReEncrypt: true });

      await expect(storage().getItem('token-key')).resolves.toBe('jwt');
      expect(asyncSafeStorage.encryptStringAsync).toHaveBeenCalledWith('jwt');
      expect(storeSet).toHaveBeenCalledWith('token-key', `enc:${Buffer.from('enc(jwt)').toString('base64')}`);
    });

    it('does not re-save a rotated token after it is removed', async () => {
      installSync();
      installAsync();
      const encryption = deferred<Buffer>();
      storeGet.mockReturnValue(`enc:${Buffer.from('old-cipher').toString('base64')}`);
      vi.mocked(asyncSafeStorage.decryptStringAsync).mockResolvedValue({ result: 'jwt', shouldReEncrypt: true });
      vi.mocked(asyncSafeStorage.encryptStringAsync).mockReturnValue(encryption.promise);
      const adapter = storage();

      const read = adapter.getItem('token-key');
      await vi.waitFor(() => expect(asyncSafeStorage.encryptStringAsync).toHaveBeenCalledWith('jwt'));
      await adapter.removeItem('token-key');
      encryption.resolve(Buffer.from('re-encrypted'));

      await expect(read).resolves.toBe('jwt');
      expect(storeSet).not.toHaveBeenCalled();
    });

    it('returns null without deleting the entry when decryption rejects', async () => {
      installSync();
      installAsync();
      storeGet.mockReturnValue(`enc:${Buffer.from('cipher').toString('base64')}`);
      vi.mocked(asyncSafeStorage.decryptStringAsync).mockRejectedValue(new Error('decrypt failed'));

      await expect(storage().getItem('token-key')).resolves.toBeNull();
      expect(storeDelete).not.toHaveBeenCalled();
    });

    it('falls back to the sync API (never calling the async crypto) when async encryption is unavailable', async () => {
      installSync();
      installAsync({ available: false });
      storeGet.mockReturnValue(`enc:${Buffer.from('cipher').toString('base64')}`);
      vi.mocked(safeStorage.decryptString).mockReturnValue('jwt');

      await expect(storage().getItem('token-key')).resolves.toBe('jwt');
      expect(safeStorage.decryptString).toHaveBeenCalledWith(Buffer.from('cipher'));
      // Critical: calling the async crypto while unavailable crashes the process on Electron 42.x.
      expect(asyncSafeStorage.decryptStringAsync).not.toHaveBeenCalled();
    });
  });
});

describe('setItem', () => {
  it('encrypts tokens before storing them (sync backend)', async () => {
    installSync();

    await storage().setItem('token-key', 'jwt');

    expect(safeStorage.encryptString).toHaveBeenCalledWith('jwt');
    expect(storeSet).toHaveBeenCalledWith('token-key', `enc:${Buffer.from('enc(jwt)').toString('base64')}`);
  });

  it('continues reading persisted storage after a successful write', async () => {
    installSync();
    storeGet.mockReturnValue(`enc:${Buffer.from('cipher').toString('base64')}`);
    vi.mocked(safeStorage.decryptString).mockReturnValue('persisted-jwt');
    const adapter = storage();

    await adapter.setItem('token-key', 'jwt');

    await expect(adapter.getItem('token-key')).resolves.toBe('persisted-jwt');
    expect(storeGet).toHaveBeenCalledWith('token-key');
  });

  it('encrypts tokens before storing them (async backend)', async () => {
    installSync();
    installAsync();

    await storage().setItem('token-key', 'jwt');

    expect(asyncSafeStorage.encryptStringAsync).toHaveBeenCalledWith('jwt');
    expect(storeSet).toHaveBeenCalledWith('token-key', `enc:${Buffer.from('enc(jwt)').toString('base64')}`);
  });

  it('does not persist a pending write after the token is removed', async () => {
    installSync();
    installAsync();
    const encryption = deferred<Buffer>();
    vi.mocked(asyncSafeStorage.encryptStringAsync).mockReturnValue(encryption.promise);
    const adapter = storage();

    const write = adapter.setItem('token-key', 'jwt');
    await vi.waitFor(() => expect(asyncSafeStorage.encryptStringAsync).toHaveBeenCalledWith('jwt'));
    await adapter.removeItem('token-key');
    encryption.resolve(Buffer.from('enc(jwt)'));
    await write;

    expect(storeSet).not.toHaveBeenCalled();
    await expect(adapter.getItem('token-key')).resolves.toBeNull();
  });

  it('does not let an older failed write replace a newer token', async () => {
    installSync();
    installAsync();
    const olderEncryption = deferred<Buffer>();
    vi.mocked(asyncSafeStorage.encryptStringAsync).mockImplementation(value => {
      return value === 'old-jwt' ? olderEncryption.promise : Promise.resolve(Buffer.from(`enc(${value})`));
    });
    storeGet.mockReturnValue(`enc:${Buffer.from('new-cipher').toString('base64')}`);
    vi.mocked(asyncSafeStorage.decryptStringAsync).mockResolvedValue({ result: 'new-jwt', shouldReEncrypt: false });
    const adapter = storage();

    const olderWrite = adapter.setItem('token-key', 'old-jwt');
    await vi.waitFor(() => expect(asyncSafeStorage.encryptStringAsync).toHaveBeenCalledWith('old-jwt'));
    await adapter.setItem('token-key', 'new-jwt');
    olderEncryption.reject(new Error('encrypt failed'));
    await olderWrite;

    await expect(adapter.getItem('token-key')).resolves.toBe('new-jwt');
    expect(storeSet).toHaveBeenCalledOnce();
    expect(storeSet).toHaveBeenCalledWith('token-key', `enc:${Buffer.from('enc(new-jwt)').toString('base64')}`);
  });

  it('falls back to the sync API (never calling the async crypto) when async encryption is unavailable', async () => {
    installSync();
    installAsync({ available: false });

    await storage().setItem('token-key', 'jwt');

    expect(safeStorage.encryptString).toHaveBeenCalledWith('jwt');
    expect(asyncSafeStorage.encryptStringAsync).not.toHaveBeenCalled();
    expect(storeSet).toHaveBeenCalledWith('token-key', `enc:${Buffer.from('enc(jwt)').toString('base64')}`);
  });

  it('does not persist when no encryption is available and no fallback is configured', async () => {
    installSync({ available: false });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const adapter = storage();

    await adapter.setItem('token-key', 'jwt');

    expect(storeSet).not.toHaveBeenCalled();
    await expect(adapter.getItem('token-key')).resolves.toBe('jwt');
    expect(storeGet).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it('persists unencrypted when no encryption is available and unencryptedFallback is enabled', async () => {
    installSync({ available: false });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await storage({ unencryptedFallback: true }).setItem('token-key', 'jwt');

    expect(storeSet).toHaveBeenCalledWith('token-key', 'raw:jwt');
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it('retains tokens in memory when unencrypted persistence fails', async () => {
    installSync({ available: false });
    storeSet.mockImplementationOnce(() => {
      throw new Error('write failed');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const adapter = storage({ unencryptedFallback: true });

    await adapter.setItem('token-key', 'jwt');

    await expect(adapter.getItem('token-key')).resolves.toBe('jwt');
    expect(storeGet).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it('only warns once across repeated saves', async () => {
    installSync({ available: false });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = storage();
    await adapter.setItem('a', '1');
    await adapter.setItem('b', '2');

    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it('does not downgrade to plaintext when encryption is available but encrypt() fails', async () => {
    ss.isEncryptionAvailable = vi.fn(() => true);
    ss.encryptString = vi.fn(() => {
      throw new Error('encrypt failed');
    });
    ss.decryptString = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Even with the fallback enabled, a *failed encrypt* (vs. unavailable encryption) must not be
    // persisted in the clear.
    const adapter = storage({ unencryptedFallback: true });
    await adapter.setItem('token-key', 'jwt');

    expect(storeSet).not.toHaveBeenCalled();
    await expect(adapter.getItem('token-key')).resolves.toBe('jwt');
    expect(storeGet).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it('resolves the cipher lazily and retries when it was initially unavailable (e.g. before app ready)', async () => {
    // Unavailable on the first probe (pre-`ready`), available afterwards.
    ss.isEncryptionAvailable = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    ss.encryptString = vi.fn((value: string) => Buffer.from(`enc(${value})`));
    ss.decryptString = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = storage();

    await adapter.setItem('token-key', 'jwt');
    expect(storeSet).not.toHaveBeenCalled(); // not persisted while unavailable
    await expect(adapter.getItem('token-key')).resolves.toBe('jwt');

    await adapter.setItem('token-key', 'jwt');
    expect(storeSet).toHaveBeenCalledWith('token-key', `enc:${Buffer.from('enc(jwt)').toString('base64')}`);

    storeGet.mockReturnValue(`enc:${Buffer.from('cipher').toString('base64')}`);
    vi.mocked(safeStorage.decryptString).mockReturnValue('persisted-jwt');
    await expect(adapter.getItem('token-key')).resolves.toBe('persisted-jwt');

    warn.mockRestore();
  });

  it('ignores a partial async surface and uses the sync API', async () => {
    // `encryptStringAsync` exists but the rest of the async trio does not — must not take the async
    // path (and must not call the async crypto).
    ss.encryptStringAsync = vi.fn();
    ss.isEncryptionAvailable = vi.fn(() => true);
    ss.encryptString = vi.fn((value: string) => Buffer.from(`enc(${value})`));
    ss.decryptString = vi.fn();

    await storage().setItem('token-key', 'jwt');

    expect(safeStorage.encryptString).toHaveBeenCalledWith('jwt');
    expect(asyncSafeStorage.encryptStringAsync).not.toHaveBeenCalled();
  });
});

describe('removeItem', () => {
  it('removes stored tokens', async () => {
    await storage().removeItem('token-key');

    expect(storeDelete).toHaveBeenCalledWith('token-key');
  });

  it('removes tokens retained after persistence is unavailable', async () => {
    installSync({ available: false });
    storeGet.mockReturnValue(undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const adapter = storage();

    await adapter.setItem('token-key', 'jwt');
    await adapter.removeItem('token-key');

    await expect(adapter.getItem('token-key')).resolves.toBeNull();
    expect(storeDelete).toHaveBeenCalledWith('token-key');
    expect(storeGet).toHaveBeenCalledWith('token-key');

    warn.mockRestore();
  });
});
