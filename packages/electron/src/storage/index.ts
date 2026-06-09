import { safeStorage } from 'electron';
import Store from 'electron-store';

import type { TokenStorage } from '../shared/types';

type StorageOptions = {
  name?: string;
};

export function storage(options: StorageOptions = {}): TokenStorage {
  const store = new Store<Record<string, string>>({ name: options.name ?? 'clerk-tokens' });

  return {
    getItem(key) {
      const encrypted = store.get(key);

      if (!encrypted) {
        return null;
      }

      try {
        return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      const encrypted = safeStorage.encryptString(value);
      store.set(key, encrypted.toString('base64'));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}
