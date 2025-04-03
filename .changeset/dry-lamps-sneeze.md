---
'@clerk/clerk-js': patch
'@clerk/clerk-react': patch
'@clerk/types': patch
---

Fixes an issue where a race condition was caused by triggering navigations during a call to `setActive`.
