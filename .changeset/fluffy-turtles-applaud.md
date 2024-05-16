---
'@clerk/clerk-js': patch
---

Remove cookie when signing out before running `onBeforeSetActive` to resolve issues where we do navigations in `onBeforeSetActive`.
