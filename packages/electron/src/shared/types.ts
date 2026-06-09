type Awaitable<T> = T | Promise<T>;

export type TokenStorage = {
  getItem: (key: string) => Awaitable<string | null>;
  setItem: (key: string, value: string) => Awaitable<void>;
  removeItem: (key: string) => Awaitable<void>;
};

export type SetupMainOptions = {
  storage: TokenStorage;
};

export type SetupMainReturn = {
  cleanup: () => void;
};

export type TokenCache = {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken: (key: string) => Promise<void>;
};
