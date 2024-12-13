---
'@clerk/clerk-js': patch
'@clerk/types': patch
'@clerk/clerk-expo': patch
---

Rename `toJSON()` resource methods to `__internal_toSnapshot()` to avoid issues with serializing functions.
