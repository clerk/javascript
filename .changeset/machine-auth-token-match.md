---
'@clerk/nextjs': patch
---

`auth()` now only uses the machine auth object forwarded by `clerkMiddleware()` when the request's bearer token is the one middleware verified. `getToken()` on a machine auth object always returns that verified token.
