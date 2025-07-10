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

/**
 * @deprecated
 * MemoryTokenCache is not secure and should only be used for testing or non-production environments.
 * For production, use the default tokenCache implementation, which uses expo-secure-store for secure storage.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/
 */
export const MemoryTokenCache = createMemoryTokenCache();
