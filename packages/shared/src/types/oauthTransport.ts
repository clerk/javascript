type Awaitable<T> = T | Promise<T>;

/**
 * Transport for OAuth/SSO flows in environments where a same-document redirect or popup
 * cannot be used (e.g. Electron, Tauri). Injected via `__internal_oauthTransport` in
 * `ClerkOptions`. Generic by design: "open a URL externally and wait for the callback
 * URL" - it knows nothing about any specific runtime.
 *
 * @internal
 */
export type OAuthTransport = {
  /**
   * The callback/redirect URL FAPI should send the provider back to. For native runtimes
   * this is an OS-registered deep link, e.g. `myapp://sso-callback`.
   */
  getRedirectUrl: () => Awaitable<string>;
  /**
   * Open the provider verification URL externally and resolve with the callback URL the
   * OS routes back to the app after auth. Rejects on user cancellation or error.
   */
  open: (url: URL) => Promise<{ callbackUrl: string }>;
};
