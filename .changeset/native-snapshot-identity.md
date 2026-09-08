---
'@clerk/clerk-js': patch
---

Reject native operations on stale sign-in, sign-up, and user snapshots before sending requests. Validate native invocation receivers and preserve the authentication attempt identity through completion. Requires the matching ClerkKit shared-runtime bridge.
