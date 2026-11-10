---
'@clerk/backend': minor
---

Add an experimental `clerkClient.oauthApplications.__experimental_exchangeToken()` method for performing an OAuth 2.0 Token Exchange (RFC 8693) on behalf of an OAuth application. Pass the application ID, its client secret, and the subject token to receive a new token issued by the application's token endpoint, for example to call a downstream API on a user's behalf.
