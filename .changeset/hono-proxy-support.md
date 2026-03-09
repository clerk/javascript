---
'@clerk/hono': minor
---

Add Frontend API proxy support to `@clerk/hono` via the `frontendApiProxy` option on `clerkMiddleware`. When enabled, requests matching the proxy path (default `/__clerk`) are forwarded to Clerk's Frontend API, allowing Clerk to work in environments where direct API access is blocked by ad blockers or firewalls. The `proxyUrl` for auth handshake is automatically derived from the request when `frontendApiProxy` is configured.
