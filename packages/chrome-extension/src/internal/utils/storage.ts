import browser from 'webextension-polyfill';

type StorageCacheOptions = {
  storageArea?: 'local' | 'sync';
};

export type StorageCache = {
  createKey: (...keys: string[]) => string;
  get: <T = any>(key: string) => Promise<T>;
  remove: (key: string) => Promise<void>;
  set: (key: string, value: string) => Promise<void>;
};

const createKey: StorageCache['createKey'] = (...keys: string[]) => keys.filter(Boolean).join('|');

// Use browser.storage (local or sync) to persist Clerk client JWT.
// More information at https://developer.chrome.com/docs/extensions/reference/storage
const createBrowserStorageCache = (opts: StorageCacheOptions = {}): StorageCache => {
  const __storageArea = opts.storageArea || 'local';

  return {
    createKey,
    get: (key: string) => browser.storage[__storageArea].get(key).then(result => result[key] || undefined),
    remove: (key: string) => browser.storage[__storageArea].remove(key),
    set: (key: string, value: string) => browser.storage[__storageArea].set({ [key]: value }),
  };
};

const createMemoryStorageCache = (): StorageCache => {
  const cache: Map<string, any> = new Map();

  return {
    createKey,
    get: (key: string) => Promise.resolve(cache.get(key)),
    remove: (key: string) => {
      cache.delete(key);
      return Promise.resolve();
    },
    set: (key: string, value: string) => {
      cache.set(key, value);
      return Promise.resolve();
    },
  };
};

export const BrowserStorageCache = createBrowserStorageCache();
export const MemoryStorageCache = createMemoryStorageCache();
