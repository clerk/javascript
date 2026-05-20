---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Deprecate `unsafeMetadata` on `user.update()`. Use `user.updateMetadata({ unsafeMetadata })` for partial updates (deep merge) instead. The parameter continues to work — metadata is now routed through `PATCH /v1/me/metadata`.
