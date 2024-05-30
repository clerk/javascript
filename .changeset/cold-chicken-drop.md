---
'@clerk/clerk-js': patch
---

Support remounting ClerkProvider multiple times by making sure that the `updateProps` call during the loading phase does not override any defaults set by `Clerk.load()` for values that are missing
