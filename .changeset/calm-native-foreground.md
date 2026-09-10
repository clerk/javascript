---
'@clerk/mobile-runtime': patch
---

Defer foreground and connectivity recovery until ongoing resource calls settle, so returning from browser authentication cannot invalidate callback redemption by rotating the client credential.
