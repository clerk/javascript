---
'@clerk/backend': minor
---

Add an experimental `clerkClient.oauthApplications.__experimental_exchangeToken()` method for performing an OAuth 2.0 Token Exchange (RFC 8693) on behalf of an OAuth application. Pass the application ID, its client secret (omitted for public applications), a user's OAuth access token, and the target `resource` to receive a new access token for that resource, for example to call a downstream API on a user's behalf. If the token endpoint rejects the exchange, the method throws an `OAuthTokenExchangeError`, exported from `@clerk/backend/errors`, with the OAuth error code in `code` (also available as `error`), `errorDescription`, and HTTP `status`.
