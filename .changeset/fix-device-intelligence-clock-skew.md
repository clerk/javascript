---
'@clerk/clerk-js': patch
---

Fix Device Intelligence tokens being discarded when the device's clock is ahead or behind the server's clock.

Prevent device clock corrections from extending cached token lifetimes, and refresh cached results when their timing reference cannot be verified.
