---
"@clerk/expo": patch
---

Fix persisted session restoration when the native Clerk singleton is created before `ClerkProvider` receives the app's token cache.
