---
'@clerk/backend': patch
---

The `createUser()` JSDoc now shows the `password_digest` format the Backend API accepts for `md5_salted` and `sha256_salted`: `hash$salt`, not `salt$hash`.
