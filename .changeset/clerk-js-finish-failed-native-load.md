---
'@clerk/clerk-js': patch
---

In `@clerk/expo` apps on iOS and Android, Clerk now finishes loading once its requests succeed again after a failed load, such as while Clerk rejects an outdated app version. Previously it stayed failed until the app restarted.
