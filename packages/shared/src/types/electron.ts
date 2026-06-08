type Awaitable<T> = T | Promise<T>;

/**
 * Internal bridge exposed by @clerk/electron from the Electron preload script.
 *
 * @internal
 */
export type ClerkElectronBridge = {
  getRedirectUrl: () => Awaitable<string>;
  openExternal: (url: string | URL) => Awaitable<void>;
  /**
   * Resolves with the native callback URL, or rejects with a known Clerk error
   * when the native browser flow does not complete.
   */
  waitForRedirectCallback: () => Awaitable<string>;
};
