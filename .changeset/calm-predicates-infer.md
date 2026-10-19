---
'@clerk/nextjs': patch
---

Fix the return type of `auth.protect()` when a predicate is passed together with the `token` option. The result is now typed from the accepted token types, so `auth.protect(() => true, { token: 'api_key' })` resolves to the API key auth object instead of a session auth object.
