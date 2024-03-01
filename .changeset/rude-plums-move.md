---
"@clerk/shared": patch
---

Ensure that inside `isValidBrowser()` and `isBrowserOnline()` the existence of `window` is checked before trying to access `window.navigator`
