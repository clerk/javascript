---
'@clerk/backend': patch
---

Add the `bcrypt_pbkdf2_sha1`, `bcrypt_pbkdf2_sha256`, `bcrypt_ssha`, `bcrypt_ssha256` and `scrypt` values to the `PasswordHasher` type, so `createUser()` and `updateUser()` accept password hashes exported from WorkOS without a type error.
