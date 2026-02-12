---
'@clerk/clerk-js': minor
'@clerk/backend': minor
---

Add `providerUserId` field to `ExternalAccount` resource as the preferred way to access the unique user ID from the OAuth provider. The existing `externalId` field is now deprecated in favor of `providerUserId` for better clarity and consistency across the API.
