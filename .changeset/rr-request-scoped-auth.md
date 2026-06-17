---
'@clerk/react-router': patch
---

Fixed a cross-user authentication issue for apps that share a single React Router `context` across requests (for example a custom server or `getLoadContext` that returns one `RouterContextProvider` instance). `getAuth()` and `rootAuthLoader()` now resolve the current request's auth from that request rather than from a value cached on the context, so a shared context can no longer cause one request to be served another user's auth under concurrency, including across React Router's action-to-loader revalidation. `clerkMiddleware()` also logs a warning once when it detects a context reused across requests, since a shared context can still leak an application's own per-request data.
