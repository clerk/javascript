---
'@clerk/fastify': patch
---

Use runtime middleware keys when creating the auth client, so secrets passed directly to `clerkPlugin()` are used for handshake nonce exchange. Also exposes the per-request `ClerkClient` instance on `request.clerk`, and adds an `enableHandshake` option to opt out of handshake redirects when using Clerk as a first-party API backend.
