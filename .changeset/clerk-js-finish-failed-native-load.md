---
'@clerk/clerk-js': patch
---

On iOS and Android, let `@clerk/expo` recover when Clerk fails to load, such as while Clerk rejects an outdated app version. A later successful reload of the initial resources now finishes loading the same Clerk instance, instead of leaving it failed until the app restarts.
