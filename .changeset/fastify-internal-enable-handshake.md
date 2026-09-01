---
'@clerk/fastify': patch
---

Add an internal `__internal_enableHandshake` option to `clerkPlugin()` (defaults to `true`). When set to `false`, the plugin skips the handshake flow and strips handshake cookies and query params before authenticating requests. Intended for API-only backends that cannot return `Set-Cookie` headers to the browser.
