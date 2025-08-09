---
'@clerk/express': patch
---

Deprecates `enableHandshake` option in `clerkMiddleware` as it's not relevant for API requests. Handshake flow only applies to server-rendered applications with page navigation, not API endpoints. This option will be removed in a future version.
