---
'@clerk/shared': patch
---

Fix detection of legacy publishable keys when determining the default Clerk API URL. Previously, legacy keys would be treated as local.
