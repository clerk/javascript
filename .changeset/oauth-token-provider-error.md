---
'@clerk/shared': minor
---

Expose `meta.providerError` on `ClerkAPIError`. When `getUserOauthAccessToken()` fails with `oauth_token_retrieval_error`, it holds the OAuth provider's error, or the OAuth setting to fix when Clerk could not authenticate to the provider.
