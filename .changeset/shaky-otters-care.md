---
'@clerk/backend': minor
---

Add `lastSignInAtAfter` and `lastSignInAtBefore` filters to the Users API list and count endpoints.

These parameters are supported by `users.getUserList()` and are forwarded to `/v1/users` and `/v1/users/count` to filter users by last sign-in timestamp.
