---
'@clerk/clerk-sdk-node': patch
---

Integrate handshake handling into `ClerkExpressWithAuth()` and `ClerkExpressRequireWith()`. If the `authenticateRequest()` returns a redirect or is in a handshake state, the middlewares will properly handle this and respond accordingly.
