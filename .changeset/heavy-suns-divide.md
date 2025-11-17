---
'@clerk/clerk-js': patch
---

Fixes a bug where billing hooks would attempt to fetch billing information for an organization member with insufficient permissions, resulting in a 403 error.
