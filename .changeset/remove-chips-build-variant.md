---
"@clerk/clerk-js": patch
"@clerk/shared": patch
---

Remove CHIPS build variant and use `partitioned_cookies` environment flag from the Clerk API to control partitioned cookie behavior at runtime.
