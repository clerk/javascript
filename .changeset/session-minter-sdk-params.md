---
'@clerk/shared': patch
'@clerk/clerk-js': patch
---

Add `oiat` field to `JwtHeader` type. Send previous session token and `force_origin` param on `/tokens` requests to support Session Minter edge token minting.
