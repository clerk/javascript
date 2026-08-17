---
'@clerk/backend': patch
---

Fix `Cookie` header parsing in `authenticateRequest()` to follow RFC 6265 and guard against a non-string `iss`. Legitimate cookies and JWTs are unaffected.

