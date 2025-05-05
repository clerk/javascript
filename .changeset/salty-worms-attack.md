---
'@clerk/shared': patch
---

Allow for `has({ role | permission})` without scope.

Examples:
- `has({role: "admin"})`
- `has({permission: "friends:add"})`
