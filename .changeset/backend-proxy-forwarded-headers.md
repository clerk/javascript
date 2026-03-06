---
'@clerk/backend': patch
---

Fix `clerkFrontendApiProxy` to derive the `Clerk-Proxy-Url` header and Location rewrites from `x-forwarded-proto`/`x-forwarded-host` headers instead of the raw `request.url`. Behind a reverse proxy, `request.url` resolves to localhost, causing FAPI to receive an incorrect proxy URL. The fix uses the same forwarded-header resolution pattern as `ClerkRequest`.
