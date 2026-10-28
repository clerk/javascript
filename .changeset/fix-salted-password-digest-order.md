---
'@clerk/backend': patch
---

Fix the `md5_salted` and `sha256_salted` entries in the `createUser()` JSDoc to show the `password_digest` format the Backend API expects: `hash$salt`, not `salt$hash`.
