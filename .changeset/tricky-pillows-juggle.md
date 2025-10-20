---
'@clerk/backend': patch
---

Fix infinite redirect loop in multi-domain development flows by reordering authentication checks to prioritize satellite sync requests over dev-browser-sync handshakes.
