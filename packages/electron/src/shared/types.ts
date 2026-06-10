type Awaitable<T> = T | Promise<T>;

export type TokenStorage = {
  getItem: (key: string) => Awaitable<string | null>;
  setItem: (key: string, value: string) => Awaitable<void>;
  removeItem: (key: string) => Awaitable<void>;
};

export type SetupMainOptions = {
  storage: TokenStorage;
  /**
   * Your Clerk publishable key, available in the Clerk Dashboard.
   *
   * Used by the main-process request interceptor to scope Clerk request handling to the
   * instance Frontend API host. In Vite-based Electron apps, pass
   * `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`.
   */
  publishableKey?: string;
};

export type SetupMainReturn = {
  cleanup: () => void;
};

export type TokenCache = {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken: (key: string) => Promise<void>;
};
