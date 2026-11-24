---
'@clerk/clerk-js': patch
---

`authenticateWithPopup()` now throws instead of navigating the popup when the identity provider URL uses a protocol other than `http:` or `https:`, matching the protocol check already applied to redirect-based sign-in and sign-up.
