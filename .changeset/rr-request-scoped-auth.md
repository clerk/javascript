---
'@clerk/react-router': patch
---

Hardened how request authentication is resolved so a reused React Router `context` can no longer leak one user's auth to another. `getAuth()` and `rootAuthLoader()` now resolve auth for the current request keyed to that request, rather than reading a value the middleware cached on the context. If the context is ever reused across requests, whether from a custom server, a shared `getLoadContext`, or a serverless adapter that reuses it on a warm instance, requests no longer cross-contaminate, including across React Router's action-to-loader revalidation. Auth is still resolved once per request and reused, so token verification and refresh happen a single time. `clerkMiddleware()` also logs a one-time warning when it detects a context reused across requests.
