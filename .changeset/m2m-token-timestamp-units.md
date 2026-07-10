---
'@clerk/backend': patch
---

Clarify in the `M2MToken`, `APIKey`, and `IdPOAuthAccessToken` JSDoc that the timestamp properties (`expiration`, `lastUsedAt`, `createdAt`, and `updatedAt`) are Unix timestamps in milliseconds (not seconds).
