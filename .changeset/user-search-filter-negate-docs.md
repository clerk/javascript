---
'@clerk/backend': patch
---

Correct the `UserSearchMetadataFilter` JSDoc. A negated `equals` filter matches users that hold the key with a different value, not every user the filter does not match, and `equals` matches any item when the key holds an array.
