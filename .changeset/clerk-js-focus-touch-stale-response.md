---
'@clerk/clerk-js': patch
---

Fixed a case where the session refresh that runs when the tab regains focus could overwrite newer user, organization or session state, or set the session cookie again after sign-out.
