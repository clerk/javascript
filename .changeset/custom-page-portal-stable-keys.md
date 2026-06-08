---
'@clerk/react': patch
---

Keep custom pages and menu items mounted when sibling pages are added, removed, or reordered. Portals are now keyed by a stable id rather than their array index, so a surviving page is reconciled as an update instead of being remounted.
