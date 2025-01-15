---
'@clerk/chrome-extension': patch
---

Fix issue "Including remotely hosted code in a Manifest V3 item" that you might have seen during audit. The affected code is now bundled with the package and as such any offending code properly tree-shaken.
