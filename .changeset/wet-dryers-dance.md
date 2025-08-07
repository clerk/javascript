---
"@clerk/backend": patch
---

Extend `buildRedirectToHandshake` to accept search params
and track delta between `session.iat` and `client.uat` in case `iat < uat`
