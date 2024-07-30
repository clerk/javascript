import type { TokenCache } from './types';

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
    clearToken: key => {
      delete cache[key];
    },
  };
};

export const MemoryTokenCache = createMemoryTokenCache();
