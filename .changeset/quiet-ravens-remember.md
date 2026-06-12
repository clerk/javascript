---
'@clerk/expo': patch
---

Fix iOS standalone session persistence after JS-owned sign-in by syncing the JS client token through ClerkKit's native device-token integration API, and keep `useNativeSession()` in sync after native client refreshes.
