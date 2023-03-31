import { getFromStorage, setInStorage } from './utils';

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
}

const createMemoryTokenCache = (): TokenCache => {
  const cache: Record<string, string> = {};
  return {
    saveToken: (key, token) => {
      cache[key] = token;
      return Promise.resolve();
    },
    getToken: key => {
      return Promise.resolve(cache[key]);
    },
  };
};

// Use chrome.storage (local or sync) to persist Clerk client JWT.
// More information athttps://developer.chrome.com/docs/extensions/reference/storage
const createChromeStorageCache = (): TokenCache => {
  return {
    saveToken: setInStorage,
    getToken: getFromStorage,
  };
};

export const ChromeStorageCache = createChromeStorageCache();
export const MemoryTokenCache = createMemoryTokenCache();
