---
'@clerk/backend': patch
---

Add `bcrypt_peppered`, `md5_salted`, `pbkdf2_sha512`, `pbkdf2_sha512_hex`, `sha256_salted`, and `sha512_symfony` to the `PasswordHasher` type, so TypeScript accepts every hasher the `createUser()` JSDoc documents. The JSDoc for `md5_salted` and `sha256_salted` now also shows the `password_digest` format the Backend API accepts: `hash$salt`, not `salt$hash`.
