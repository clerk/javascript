---
'@clerk/clerk-js': patch
---

fix(clerk-js): Prevent background token refresh from destroying sessions on mobile

On iOS, background thread throttling can starve the JS event loop for hours (e.g., overnight audio apps). When the SDK's background refresh timer eventually fires with stale credentials, the resulting 401 would trigger `handleUnauthenticated()` and destroy the session even though it's still valid on the server.

This fix adds two protections to `#refreshTokenInBackground()`:
- If the token has already expired when the timer fires, bail out instead of sending a stale request
- On mobile runtimes (Expo), skip `handleUnauthenticated` for background refresh 401s so the session isn't destroyed as a side effect
