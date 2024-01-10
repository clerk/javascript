---
'@clerk/backend': patch
---

Fix an error in the handshake flow where the request would throw an unhandled error when verification of the handshake payload fails.
