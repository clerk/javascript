---
'@clerk/fastify': patch
---

`clerkPlugin()` with `__internal_enableHandshake: false` now relies on `@clerk/backend` to ignore stale handshake cookies on requests that cannot complete a handshake, instead of stripping them itself. Handshake redirects are no longer suppressed for the rare navigation request that reaches an API-only backend; they behave the same as in every other Clerk SDK.
