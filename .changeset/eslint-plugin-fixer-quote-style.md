---
'@clerk/eslint-plugin': patch
---

The `require-auth-protection` fixer now matches the string quote style of existing imports when inserting a new `auth` import.

Previously, new imports always used single quotes regardless of how other imports in the file were quoted.
