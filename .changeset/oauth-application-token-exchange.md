---
'@clerk/backend': minor
---

Add an experimental `clerkClient.oauthApplications.__experimental_exchangeToken()` method for performing an OAuth 2.0 Token Exchange (RFC 8693) on behalf of an OAuth application. Pass your publishable key, the application's client ID and client secret, a user's OAuth access token, and the target `resource` to receive a new access token for that resource, for example to call a downstream API on a user's behalf. The request goes to your instance's token endpoint, derived from the publishable key (or from `proxyUrl` when set), so it does not require a secret key. If the token endpoint rejects the exchange, the method throws an `OAuthTokenExchangeError`, exported from `@clerk/backend/errors`, with the OAuth error code in `code` (also available as `error`), `errorDescription`, and HTTP `status`.
