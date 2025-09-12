---
'@clerk/backend': patch
---

Fix a case where handshakes would get triggered in a loop on cross origin requests in development.
