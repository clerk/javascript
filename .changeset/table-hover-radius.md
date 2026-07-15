---
'@clerk/ui': patch
---

Fix table row hover styling so the rounded bottom corners are only applied to the last row, matching the table's border radius. Previously any hovered row showed a stray corner radius.
