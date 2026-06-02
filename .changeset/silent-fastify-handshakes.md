---
'@clerk/fastify': patch
---

Fixed `clerkPlugin()` to honor `publishableKey` and `secretKey` passed in plugin options when authenticating Fastify requests. The plugin now also exposes `request.clerk`, which uses the same plugin keys and resolves the correct Clerk API host for non-production publishable keys.
