---
'@clerk/backend': minor
---

Add `clerkClient.users.replaceUserMetadata(userId, params)` for full-replacement metadata updates. Deprecate the `publicMetadata`, `privateMetadata`, and `unsafeMetadata` parameters on `clerkClient.users.updateUser` — use `updateUserMetadata` for partial updates (deep merge) or `replaceUserMetadata` for full replacement.
