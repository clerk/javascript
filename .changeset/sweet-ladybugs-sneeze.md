---
'@clerk/backend': patch
---

Add the following properties to `users.updateUser(userId, params)` params:

  - `password_hasher`
  - `password_digest`
  - `publicMetadata`
  - `privateMetadata`
  - `unsafeMetadata`