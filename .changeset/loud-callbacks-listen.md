---
'@clerk/cli-auth': minor
---

Add `@clerk/cli-auth`: reusable OAuth 2.0 + PKCE localhost-callback flow for adding Clerk authentication to Node.js CLIs. Provides browser-based sign-in via a one-shot localhost callback server, token storage (keychain with file fallback, file, or memory), token refresh, revocation, `/oauth/userinfo` lookup, optional Clerk API key verification, and tunable timeouts (`loginTimeoutMs` for the browser sign-in wait, `requestTimeoutMs` for each outbound HTTP call).
