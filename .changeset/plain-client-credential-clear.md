---
'@clerk/shared': patch
'@clerk/expo': patch
---

Clear native credentials when the server removes a client and prevent older responses from restoring them. Expo also clears custom read/write-only token caches when changing instances or receiving a client-clear response.
