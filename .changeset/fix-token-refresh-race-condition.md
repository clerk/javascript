---
"@clerk/clerk-js": patch
---

Fix race condition where multiple browser tabs could fetch session tokens simultaneously. `getToken()` now uses a cross-tab lock to coordinate token refresh operations
