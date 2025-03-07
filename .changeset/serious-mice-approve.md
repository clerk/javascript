---
'@clerk/clerk-js': patch
---

When a user passes `withSignUp={false}` we should opt out of combined flow even when `signUpUrl` is undefined.
