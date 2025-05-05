---
'@clerk/shared': patch
---

Fix infinite pending loading when an inline script fails before event listeners are set by adding a timeout.
