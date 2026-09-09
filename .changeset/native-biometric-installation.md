---
"@clerk/clerk-js": patch
---

Reconcile biometric credentials when a native host reports a new app installation. Remove surviving keys for the current app before biometric use, retain other apps' metadata, and retry incomplete cleanup without marking the installation complete. Recognized installations preserve enrollment.
