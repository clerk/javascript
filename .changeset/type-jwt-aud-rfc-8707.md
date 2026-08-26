---
'@clerk/shared': patch
'@clerk/backend': patch
---

Type the JWT `aud` claim as an optional `string | string[]` per RFC 7519. Clerk-issued OAuth access tokens may include a single RFC 8707 resource URI as a string.
