---
'@clerk/ui': patch
---

Organization member pages reset search and action state when the active organization changes. Commands from the previous organization cannot update roles, remove members, or change pagination. Pending search timers stop when the page closes.
