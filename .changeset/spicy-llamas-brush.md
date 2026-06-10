---
'@clerk/express': patch
---

Fix an authentication bypass where a `req.auth` value set by another library (such as `express-jwt`, Passport, or `express-openid-connect`) caused `clerkMiddleware()` and `requireAuth()` to silently skip Clerk authentication, and `getAuth()` to return the unverified foreign value. Clerk now brands the `req.auth` handler it installs and only trusts that handler: `clerkMiddleware()` authenticates the request and overwrites a foreign `req.auth` (logging a warning when it does), and `getAuth()` throws its "middleware required" error instead of reading foreign data.
