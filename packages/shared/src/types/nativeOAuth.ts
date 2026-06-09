/**
 * The result of opening an external OAuth/SSO verification URL in the system browser and waiting for
 * the native (custom-scheme or loopback) callback.
 *
 * `cancelled` is only produced by runtimes that can detect a user dismissal (e.g. Expo's
 * `expo-web-browser`). Runtimes that cannot observe cancellation (e.g. Electron opening the system
 * browser via `shell.openExternal`) simply never resolve with it and instead reject on timeout.
 */
export type NativeOAuthOpenResult =
  | {
      type: 'success';
      /**
       * The custom-scheme callback URL the OS handed back, e.g.
       * `myapp://sso-callback?rotating_token_nonce=...`.
       */
      callbackUrl: string;
    }
  | {
      /**
       * The user dismissed the system browser before completing the flow, on runtimes that can detect it.
       */
      type: 'cancelled';
    };

/**
 * A runtime-agnostic handler that performs an OAuth/SSO verification outside of the embedding webview.
 *
 * A native SDK (e.g. a future `@clerk/electron`) provides an implementation via the
 * `__internal_nativeOAuthHandler` Clerk option. When no handler is registered, Clerk uses its default
 * web redirect and popup flows, so this abstraction keeps Clerk core unaware of any specific runtime.
 */
export type NativeOAuthHandler = {
  /**
   * Returns the native callback redirect URL that Clerk should bake into the OAuth `create` call
   * (e.g. `myapp://sso-callback`). It is asynchronous and resolved per flow so an implementation can
   * arm its callback listener and/or allocate a loopback port before the system browser is opened.
   */
  getRedirectUrl: () => Promise<string>;
  /**
   * Opens `url` (the provider verification URL) in the system browser and resolves with the callback
   * the OS routes back. Resolves with `{ type: 'cancelled' }` if the runtime can detect a user
   * dismissal; rejects on timeout or failure.
   */
  open: (url: URL) => Promise<NativeOAuthOpenResult>;
};
