type ChromeStorageCacheOptions = {
  storageArea?: 'local' | 'sync';
};

// Use chrome.storage (local or sync) to persist Clerk client JWT.
// More information at https://developer.chrome.com/docs/extensions/reference/storage
const createChromeStorageCache = (opts: ChromeStorageCacheOptions = {}) => {
  const __storageArea = opts.storageArea || 'local';

  return {
    createKey: (...keys: string[]) => keys.filter(Boolean).join('|'),
    get: (key: string) => chrome.storage[__storageArea].get(key).then(result => result[key] || undefined),
    remove: (key: string) => chrome.storage[__storageArea].remove(key),
    set: (key: string, value: string) => chrome.storage[__storageArea].set({ [key]: value }),
  };
};

export const ChromeStorageCache = createChromeStorageCache();
