---
"@clerk/shared": patch
---

Fix `getToken({ template })` not working in React Native by correcting `isValidBrowser()` and `isBrowserOnline()` to return `true` in non-browser environments instead of `false`
