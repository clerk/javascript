---
'@clerk/astro': patch
---

Allow unstyled button components to accept a single React element passed as an array. Fixes a misleading "multiple children" error that could appear when a custom button child crossed a server/client boundary and arrived as a one-item array.
