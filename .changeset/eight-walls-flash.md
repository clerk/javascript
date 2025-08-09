---
'@clerk/express': patch
---

Deprecates `enableHandshake` option in `clerkMiddleware`. This option is unnecessary for API requests since they don't trigger handshake flows. The option will be removed in a future version.