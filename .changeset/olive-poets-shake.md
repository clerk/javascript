---
'@clerk/nextjs': patch
---

Fix a cross-request credential leak in `clerkMiddleware()`. When using dynamic keys (an options callback that resolves a different `secretKey` per request), a `clerkClient()` call made inside the middleware handler could be built with another concurrent request's secret key. Each request now gets its own isolated store, so the keys resolved for a request are only ever visible to that request.
