---
'@clerk/clerk-js': patch
---

Remove side-effect from `Session` resource initialization that triggered a session cookie update. This cookie update is now explicitly part of the `Clerk.load()` flow.
