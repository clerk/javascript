export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  deleteToken: (key: string) => void;
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
    deleteToken: key => {
      delete cache[key];
    },
  };
};

export const MemoryTokenCache = createMemoryTokenCache();
