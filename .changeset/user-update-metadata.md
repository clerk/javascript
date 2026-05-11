---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add `user.updateMetadata({ unsafeMetadata })` on the `UserResource`. Hits `PATCH /v1/me/metadata` with deep-merge semantics — top-level and nested keys are merged with the existing `unsafeMetadata`, and any key set to `null` is removed. Only `unsafeMetadata` is writable; `publicMetadata` and `privateMetadata` remain Backend-API only.
