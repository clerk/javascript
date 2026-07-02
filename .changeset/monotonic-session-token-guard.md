---
'@clerk/clerk-js': patch
---

Prevent a staler session token from overwriting a fresher one on the same tab. Freshness is ranked by the JWT `oiat` header, then `iat`; tokens without `oiat` always pass through.
