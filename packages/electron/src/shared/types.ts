type Awaitable<T> = T | Promise<T>;

export type TokenStorage = {
  getItem: (key: string) => Awaitable<string | null>;
  setItem: (key: string, value: string) => Awaitable<void>;
  removeItem: (key: string) => Awaitable<void>;
};

export type CreateClerkBridgeOptions = {
  /**
   * Storage adapter used by the main process to persist Clerk tokens.
   */
  storage: TokenStorage;
  /**
   * Registers the custom scheme used to serve the Electron renderer from a stable origin.
   */
  renderer?: RendererSchemeOptions;
};

export type ClerkBridge = {
  /**
   * Removes IPC handlers and listeners registered by `createClerkBridge`.
   */
  cleanup: () => void;
};

export type RendererSchemeOptions = {
  /**
   * Custom scheme used for the renderer origin.
   */
  scheme: string;
  /**
   * Custom host used for the renderer origin.
   */
  host: string;
};

export type TokenCache = {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken: (key: string) => Promise<void>;
};

export type OAuthTransport = {
  getRedirectUrl: () => Promise<string>;
  open: (url: string) => Promise<{ callbackUrl: string }>;
};
