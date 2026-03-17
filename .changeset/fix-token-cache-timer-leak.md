---
'@clerk/clerk-js': patch
---

Fix token cache refresh timer leak that caused accelerating token refresh requests. When `set()` was called multiple times for the same cache key (e.g., from `_updateClient` hydration and `#refreshTokenInBackground`), old refresh timers were never cancelled, causing orphaned timers to accumulate. Each leaked timer independently fired `onRefresh`, making the poller appear erratic — especially after `session.touch()` or organization switching.
