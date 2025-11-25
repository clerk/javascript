---
"@clerk/clerk-js": patch
---

Fix race condition where multiple browser tabs could fetch session tokens simultaneously. 

Key changes:
- `getToken()` now uses a cross-tab lock (via Web Locks API or localStorage fallback) to coordinate token refresh operations
- Per-tokenId locking allows different token types (different orgs, JWT templates) to be fetched in parallel while preventing duplicates for the same token
- Double-checked locking pattern: cache is checked before and after acquiring the lock, so tabs that wait will find the token already cached by the tab that fetched it
- Graceful timeout handling: if lock acquisition times out (~5 seconds), the operation proceeds in degraded mode rather than failing
- Removed redundant lock from SessionCookiePoller since coordination is now handled within `getToken()` itself

This ensures all callers of `getToken()` (pollers, focus handlers, user code) automatically benefit from cross-tab coordination.
