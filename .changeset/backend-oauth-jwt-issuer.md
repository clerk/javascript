---
'@clerk/backend': patch
---

Verify the issuer of OAuth access token JWTs. When `authenticateRequest()` verifies an OAuth access token in JWT format, the token's `iss` claim must now exactly match the instance's Frontend API URL, derived from the publishable key (for example `https://clerk.example.com`). Tokens with a different, empty, missing or non-string `iss` are rejected with a `token-verification-failed` error. This also applies when a proxy URL is configured, because the token is issued by the Frontend API rather than the proxy. Opaque OAuth tokens and M2M tokens are not affected.
