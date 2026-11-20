---
'@clerk/backend': minor
---

Tighten JWT verification in `authenticateRequest()` and `verifyMachineAuthToken()`:

- Reject session tokens and machine JWTs whose `exp`, `nbf` or `iat` is not a finite number, and reject expired or not-yet-valid tokens even when the claim is beyond the range a JavaScript `Date` can represent.
- Require an OAuth access token JWT's `iss` to match the instance's Frontend API URL or, when one is configured, its `proxyUrl`. `verifyMachineAuthToken()` accepts a new `proxyUrl` option for this. It now rejects an OAuth access token JWT when no valid `publishableKey` is passed, because the expected issuer can't be derived.
- On an instance that uses a proxy, the Frontend API issues OAuth access tokens with the proxy URL configured in the Clerk Dashboard as their `iss` by default. Every backend that verifies OAuth access token JWTs for that instance, including a separate API or MCP server, must set `proxyUrl` to exactly that URL (framework SDKs read it from `CLERK_PROXY_URL`). Without it, or with a different value such as another host or a trailing slash, those tokens are rejected with `token-verification-failed`.
- When the JWKS for a machine JWT can't be loaded, report `secret-key-invalid` or the new `jwk-remote-failed-to-load` reason instead of `token-verification-failed`.
