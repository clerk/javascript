---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/backend': patch
---

Session `expireAt` and `abandonAt` no longer special-case a `0` deadline; the backend now always sends a real deadline.
