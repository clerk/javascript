---
'@clerk/clerk-js': patch
---

Remove cache revalidation hooks from pending session handling. This fixes unmounting issues from `SignIn` and `SignUp` AIOs during after-auth flows.
