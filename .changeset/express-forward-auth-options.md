---
"@clerk/express": patch
---

Forward all `AuthenticateRequestOptions` and `VerifyTokenOptions` passed to `clerkMiddleware()` through to the backend `authenticateRequest()` call. Previously only a hand-picked subset was forwarded, so options like `organizationSyncOptions`, `skipJwksCache`, and `headerType` were accepted by the TypeScript types but silently ignored at runtime — the same class of bug that caused `clockSkewInMs` to be dropped.
