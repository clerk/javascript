---
'@clerk/clerk-js': patch
---

Use `__clerk_redirect_url` instead of `__clerk_satellite_url` to ensure satellite domain syncing works across server and browser SDKs.
