---
"@clerk/express": patch
---

Forward all `AuthenticateRequestOptions` and `VerifyTokenOptions` passed to `clerkMiddleware()` through to the backend `authenticateRequest()` call. Previously only a hand-picked subset was forwarded, so options like `organizationSyncOptions`, `skipJwksCache`, and `headerType` were accepted by the TypeScript types but silently ignored at runtime — the same class of bug that caused `clockSkewInMs` to be dropped.

Additionally, when `apiUrl` or `apiVersion` are passed to `clerkMiddleware()` and no custom `clerkClient` is supplied, the middleware now builds a per-middleware `ClerkClient` configured with those values instead of using the env-only default singleton. This is required because `@clerk/backend` pins `apiUrl`/`apiVersion` at client construction time and ignores runtime overrides on `authenticateRequest()`. Passing your own `clerkClient` continues to take precedence.
