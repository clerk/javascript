---
'@clerk/clerk-js': patch
---

Fix `getToken()` returning an expired session token when the device clock runs behind and a token is cached again, or a staler token arrives after a fresher one.
