import { safeStorage } from 'electron';
import Store from 'electron-store';

import type { TokenStorage } from '../shared/types';

type StorageOptions = {
  /**
   * The name of the file (without extension) used to persist tokens.
   *
   * @default 'clerk-tokens'
   */
  name?: string;
  /**
   * The directory in which the token file is stored. Maps to `electron-store`'s `cwd` option.
   * When omitted, the OS default user config directory is used.
   */
  path?: string;
  /**
   * When OS-level encryption is unavailable (e.g. a Linux machine without a keyring), tokens are
   * not persisted by default, which signs the user out on the next app launch. Set this to `true`
   * to instead persist tokens **unencrypted** in that scenario, keeping the user signed in across
   * restarts at the cost of storing tokens in plaintext on disk.
   *
   * @default false
   */
  unencryptedFallback?: boolean;
};

/**
 * Marks a value that was encrypted via {@link safeStorage}; the remainder is base64 ciphertext.
 * values will be stored as: `enc:<encrypted value>`
 */
const ENCRYPTED_PREFIX = 'enc:';
/**
 * Marks a value persisted unencrypted via the `unencryptedFallback` option.
 * values will be stored as: `raw:<value>`
 */
const RAW_PREFIX = 'raw:';

type Cipher = {
  encrypt: (value: string) => Promise<string>;
  /**
   * Decrypts a base64 payload. `shouldReEncrypt` is `true` (async backend only) when the OS key
   * has rotated and the payload should be re-encrypted with the new key.
   */
  decrypt: (payload: string) => Promise<{ value: string; shouldReEncrypt: boolean }>;
};

type AsyncSafeStorage = {
  encryptStringAsync: (plainText: string) => Promise<Buffer>;
  decryptStringAsync: (encrypted: Buffer) => Promise<{ result: string; shouldReEncrypt: boolean }>;
  isAsyncEncryptionAvailable: () => Promise<boolean>;
};

const syncCipher: Cipher = {
  encrypt: value => Promise.resolve(safeStorage.encryptString(value).toString('base64')),
  decrypt: payload =>
    Promise.resolve({ value: safeStorage.decryptString(Buffer.from(payload, 'base64')), shouldReEncrypt: false }),
};

function hasAsyncSafeStorage(storage: typeof safeStorage): storage is typeof safeStorage & AsyncSafeStorage {
  const candidate = storage as Partial<AsyncSafeStorage>;

  return (
    typeof candidate.encryptStringAsync === 'function' &&
    typeof candidate.decryptStringAsync === 'function' &&
    typeof candidate.isAsyncEncryptionAvailable === 'function'
  );
}

function createAsyncCipher(storage: AsyncSafeStorage): Cipher {
  return {
    encrypt: async value => (await storage.encryptStringAsync(value)).toString('base64'),
    decrypt: async payload => {
      const { result, shouldReEncrypt } = await storage.decryptStringAsync(Buffer.from(payload, 'base64'));
      return { value: result, shouldReEncrypt };
    },
  };
}

/**
 * Resolves the crypto backend to use, or `null` when no OS encryption is currently available.
 */
async function resolveCipher(): Promise<Cipher | null> {
  // Prefer the async API, but only when the full optional function surface exists.
  if (hasAsyncSafeStorage(safeStorage)) {
    try {
      if (await safeStorage.isAsyncEncryptionAvailable()) {
        return createAsyncCipher(safeStorage);
      }
    } catch {
      /* fall through to the synchronous API */
    }
  }

  // The synchronous API blocks the calling thread on the OS prompt during the first encrypt/decrypt,
  if (typeof safeStorage.isEncryptionAvailable === 'function' && safeStorage.isEncryptionAvailable()) {
    return syncCipher;
  }

  return null;
}

/**
 * Creates a secure {@link TokenStorage} adapter for the Electron main process.
 *
 * Tokens are persisted with `electron-store` and encrypted at rest using Electron's
 * {@link safeStorage} API, which is backed by the OS keystore (Keychain on macOS, DPAPI on
 * Windows, libsecret/kwallet on Linux). It uses Electron 42's async `safeStorage` API only when it
 * reports itself available (which generally requires a code-signed app) and otherwise falls back to
 * the synchronous API. Pass the result to `setupMain({ storage: storage() })`.
 *
 * Behavior is secure by default: when OS encryption is unavailable the adapter does not persist
 * tokens (the user will be signed out on restart) unless {@link StorageOptions.unencryptedFallback}
 * is enabled. Undecryptable entries return `null`.
 *
 * @example
 * ```ts
 * import { setupMain } from '@clerk/electron';
 * import { storage } from '@clerk/electron/storage';
 *
 * setupMain({ storage: storage({ name: 'my-app-tokens' }) });
 * ```
 */
export function storage(options: StorageOptions = {}): TokenStorage {
  const store = new Store<Record<string, string>>({
    name: options.name ?? 'clerk-tokens',
    ...(options.path ? { cwd: options.path } : {}),
  });

  let cachedCipher: Cipher | null = null;
  let resolving: Promise<Cipher | null> | null = null;
  const getCipher = (): Promise<Cipher | null> => {
    if (cachedCipher) {
      return Promise.resolve(cachedCipher);
    }
    resolving ??= resolveCipher().then(resolved => {
      resolving = null;
      if (resolved) {
        cachedCipher = resolved;
      }
      return resolved;
    });
    return resolving;
  };

  let warned = false;
  const warnOnce = (message: string) => {
    if (warned) {
      return;
    }
    warned = true;
    console.warn(message);
  };

  return {
    async getItem(key) {
      const stored = store.get(key);

      if (!stored) {
        return null;
      }

      if (stored.startsWith(RAW_PREFIX)) {
        return stored.slice(RAW_PREFIX.length);
      }

      if (stored.startsWith(ENCRYPTED_PREFIX)) {
        const cipher = await getCipher();

        // No usable OS encryption, preserve entry.
        if (!cipher) {
          return null;
        }

        const payload = stored.slice(ENCRYPTED_PREFIX.length);

        try {
          const { value, shouldReEncrypt } = await cipher.decrypt(payload);

          if (shouldReEncrypt) {
            // OS key has rotated, persist with new value
            try {
              store.set(key, ENCRYPTED_PREFIX + (await cipher.encrypt(value)));
            } catch {
              // keep the existing payload; it still decrypts for now
            }
          }

          return value;
        } catch {
          // Decryption failed, preserve the entry, new write on next sign-in.
          return null;
        }
      }

      // Unknown or unrecognized format, drop the entry so we don't repeatedly fail on it.
      store.delete(key);
      return null;
    },
    async setItem(key, value) {
      const cipher = await getCipher();

      if (!cipher) {
        if (options.unencryptedFallback) {
          warnOnce(
            'Clerk: OS encryption is unavailable; falling back to unencrypted storage. Session tokens are being stored unencrypted on local disk.',
          );
          store.set(key, RAW_PREFIX + value);
        } else {
          warnOnce(
            'Clerk: OS encryption is unavailable and unencryptedFallback is not enabled, so tokens are not being persisted. The user will be signed out on the next launch. Pass `storage({ unencryptedFallback: true })` to persist unencrypted (less secure).',
          );
        }
        return;
      }

      try {
        store.set(key, ENCRYPTED_PREFIX + (await cipher.encrypt(value)));
      } catch {
        // Encryption is available but encryption failed
        warnOnce('Clerk: failed to encrypt the session token; it was not persisted.');
      }
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}
