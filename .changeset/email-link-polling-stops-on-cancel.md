---
'@clerk/shared': patch
'@clerk/clerk-js': patch
---

Fix email link and enterprise SSO link verification continuing to check for the link after it was cancelled, for example when the user leaves the verification screen. Restarting a cancelled flow no longer leaves a second check running.
