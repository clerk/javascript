---
'@clerk/fastify': patch
---

`clerkPlugin()` with `__internal_enableHandshake: false` now relies on `@clerk/backend` to ignore stale handshake cookies on API requests instead of stripping them itself. Behavior is unchanged for API-only backends. Handshake redirects are still skipped, and dev-browser handshakes still go through.
