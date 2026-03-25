---
'@clerk/ui': patch
---

Fix false positive in structural CSS detection where Clerk's own internal classes (`.cl-internal-*`) were incorrectly triggering the warning on fresh installs.
