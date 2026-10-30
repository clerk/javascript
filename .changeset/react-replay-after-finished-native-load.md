---
'@clerk/react': patch
---

When a Clerk instance passed to `<ClerkProvider>` on iOS and Android fails to load and later finishes loading, `<ClerkProvider>` now reports it as loaded and runs the calls it queued while loading, without needing a new instance.
