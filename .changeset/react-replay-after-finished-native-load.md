---
'@clerk/react': patch
---

In `@clerk/expo` apps on iOS and Android, when Clerk fails to load and later finishes loading, `<ClerkProvider>` now reports Clerk as loaded and runs the calls made while it was loading. Previously `isLoaded` stayed `false` until the app restarted.
