---
'@clerk/clerk-js': patch
---

`user.update({ unsafeMetadata })` now replaces unsafe metadata with a single request instead of reloading the user first.
