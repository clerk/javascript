/**
 * Web-only implementation. Resolved by Metro / the bundler in place of
 * `maybeCompleteAuthSession.ts` when targeting `web`.
 *
 * Must stay synchronous during render so the OAuth/SSO redirect URL is caught
 * before children mount.
 */
export function maybeCompleteAuthSession(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const WebBrowser = require('expo-web-browser');
    WebBrowser.maybeCompleteAuthSession();
  } catch (e) {
    if (__DEV__) {
      console.warn('[ClerkProvider] expo-web-browser not available, OAuth/SSO on web will not work:', e);
    }
  }
}
