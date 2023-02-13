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

export const MemoryTokenCache = createMemoryTokenCache();
