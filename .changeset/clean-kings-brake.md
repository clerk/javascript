---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Add a custom logger to allow logging a message or warning to the console once per session, in order to avoid consecutive identical logs due to component rerenders.
