---
'@clerk/nextjs': patch
---

Fix a bug where response headers from `@clerk/backend` would not be applied to the response when a redirect was triggered from a custom middleware handler.
