---
'@clerk/clerk-js': patch
---

fix(clerk-js): Prevent background token refresh from destroying sessions on mobile

On iOS, background thread throttling can starve the JS event loop for hours (e.g., overnight audio apps). When the SDK's background refresh timer eventually fires with stale credentials, the resulting 401 would trigger `handleUnauthenticated()` and destroy the session even though it's still valid on the server.

Adds an early return in `#refreshTokenInBackground()`, gated to headless/mobile runtimes only (Expo sets `runtimeEnvironment` to `'headless'`). If the token has already expired when the refresh timer fires, bail out instead of sending a request with stale credentials. The next foreground `getToken()` call handles token acquisition through the normal path with proper retry logic.
