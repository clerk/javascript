/**
 * Public entry point for @clerk/cli-auth.
 *
 * The main class is `ClerkCliAuth` — instantiate with config, then:
 *   - await auth.login() → opens browser, starts localhost callback, exchanges code, stores tokens
 *   - await auth.getAccessToken() → returns cached token, refreshes if expired
 *   - await auth.whoami() → calls /oauth/userinfo with cached token
 *   - await auth.logout() → clears stored tokens (and revokes at issuer by default)
 *
 * Implementation lives in ./clerk-cli-auth.ts and ./lib/*.
 */

export { ClerkCliAuth } from './clerk-cli-auth';
export * from './types';
export * from './errors';
export { fetchIdentity, revokeToken } from './lib/token-exchange';
export { verifyToken } from './lib/verify-token';
