---
'@clerk/hono': patch
---

Fix `getAuth()` to correctly filter by `acceptsToken` option. Previously, `getAuth(c, { acceptsToken: 'api_key' })` would accept any token type (including session tokens) because the token type filtering was hardcoded to `'any'` in the middleware. Now `getAuth()` properly rejects tokens that don't match the specified `acceptsToken`, consistent with other SDKs.

Also add support for `CLERK_MACHINE_SECRET_KEY` environment variable. This enables M2M token scope verification without needing to pass `machineSecretKey` explicitly to `clerkMiddleware()`.
