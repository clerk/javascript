---
'@clerk/clerk-js': patch
---

Fix `getToken()` returning a session token after it expired on the server when the device clock runs behind.
