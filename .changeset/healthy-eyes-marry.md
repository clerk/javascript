---
'@clerk/types': patch
---

Fix using `ClerkPaginationRequest` type without passing a generic.

Before the fix the `ClerkPaginationRequest = any` and after the fix the `ClerkPaginationRequest = { limit, offset }`.