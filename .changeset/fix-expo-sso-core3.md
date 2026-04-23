---
'@clerk/expo': patch
---

Migrate `useSSO` hook from legacy to core-3 API and fix browser dismissal for OAuth/SSO flows. The hook now handles session activation internally, so callers no longer need to call `setActive`. Also handles stale session recovery by clearing JWT from SecureStore when `session_exists` errors occur, and dismisses the in-app browser after auth to prevent it from lingering in the background on subsequent sign-in attempts.
