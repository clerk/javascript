---
'@clerk/clerk-js': patch
---

getToken() on a non-active session no longer writes that session's token into the __session cookie.
