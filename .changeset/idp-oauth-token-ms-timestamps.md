---
'@clerk/backend': patch
---

Return `IdPOAuthAccessToken` timestamps in milliseconds when an OAuth access token is verified as a JWT. The `expiration`, `createdAt`, and `updatedAt` fields were previously populated with the JWT's raw second-based `exp`/`iat` values, making them inconsistent with the same fields on `M2MToken` and with the values returned when the token is fetched from the API. Comparing `expiration` against `Date.now()` now behaves as expected. The `expired` flag was already computed correctly and is unaffected.
