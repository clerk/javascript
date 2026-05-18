---
'@clerk/backend': minor
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Deprecate metadata updates via `clerkClient.users.updateUser` and `user.update()` to mirror the deprecation of `publicMetadata`, `privateMetadata`, and `unsafeMetadata` on `PATCH /v1/users/{userId}` and `PATCH /v1/me`.

`@clerk/backend`: add `clerkClient.users.replaceUserMetadata(userId, params)` for full-replacement updates. Deprecate the `publicMetadata`, `privateMetadata`, and `unsafeMetadata` parameters on `clerkClient.users.updateUser` — use `updateUserMetadata` for partial updates (deep merge) or `replaceUserMetadata` for full replacement.

`@clerk/clerk-js`: deprecate `unsafeMetadata` on `user.update()`. Use `user.updateMetadata({ unsafeMetadata })` for partial updates (deep merge) instead. 
