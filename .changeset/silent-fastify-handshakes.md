---
'@clerk/fastify': minor
---

Add an `enableHandshake` option to `clerkPlugin()` (defaults to `true`). When set to `false`, the plugin skips the handshake flow and strips handshake cookies (`__clerk_handshake`, `__clerk_handshake_nonce`) and query params before authenticating the request. This is useful for pure API backends (e.g. a SPA calling a Fastify server) where the server cannot return `Set-Cookie` headers to the browser, which would otherwise cause stale handshake nonces to be reused and trigger repeated `404` errors from the Frontend API.
