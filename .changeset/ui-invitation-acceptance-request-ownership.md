---
'@clerk/ui': patch
---

Prevent overlapping invitation acceptance actions from clearing each other's loading state. Stop follow-up requests when the organization switcher is removed from the page, while preserving acceptance when its menu closes and reopens.
