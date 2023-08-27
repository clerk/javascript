---
'@clerk/clerk-js': patch
---

Set SameSite=Lax for dev browser cookie, instead of Strict, so that it can be read from the server after redirects
