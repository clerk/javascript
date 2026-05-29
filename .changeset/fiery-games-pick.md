---
'@clerk/clerk-js': patch
---

Fix inconsistent `fetchStatus` during sign-in and sign-up flows where the resource would briefly show as `complete` while `fetchStatus` was still `fetching`
