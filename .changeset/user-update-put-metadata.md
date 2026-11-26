---
'@clerk/clerk-js': patch
---

`user.update({ unsafeMetadata })` now replaces unsafe metadata with a single request instead of reloading the user first. Keys set to `null` are now stored as `null` instead of being removed, matching the behavior before 6.16.1. To remove a key, leave it out of `unsafeMetadata`.
