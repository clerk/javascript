---
'@clerk/mosaic': patch
'@clerk/shared': patch
---

Cache the active devices list in Mosaic's `UserProfile` so it shows immediately when the section is opened again, and clear it on sign out.
