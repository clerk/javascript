---
'@clerk/electron': patch
---

Forward OAuth deep-link callbacks to the primary Electron process on Windows and Linux. Applications
that already manage Electron's process-wide single-instance lock can disable Clerk's lock management.
