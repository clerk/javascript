---
'@clerk/electron': patch
---

Fix sign-in flows when OS-backed token persistence is unavailable by retaining the current client token for the lifetime of the Electron renderer.
