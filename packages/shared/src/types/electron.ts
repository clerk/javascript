type Awaitable<T> = T | Promise<T>;

/**
 * Handler for OAuth/SSO flows in environments where a browser redirect or popup cannot be used
 * (e.g. Electron, Tauri). Register via `__internal_nativeOAuthHandler` in `ClerkOptions`.
 *
 * @internal
 */
export type NativeOAuthHandler = {
  /**
   * Returns the deep-link callback URL that the host runtime has registered with the OS
   * (e.g. `myapp://sso-callback`). Clerk passes this to FAPI as the `redirectUrl` so the
   * provider redirects back through the native callback instead of a web route.
   */
  getRedirectUrl: () => Awaitable<string>;
  /**
   * Opens the provider verification URL through the host runtime (e.g. via
   * `shell.openExternal` in Electron) and resolves with the callback URL that the OS routes
   * back to the app after auth completes. Rejects on cancellation or error.
   */
  open: (url: URL) => Promise<{ callbackUrl: string }>;
};
