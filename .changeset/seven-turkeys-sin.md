---
'@clerk/shared': patch
---

Bug fix for billing hooks that would sometimes fire requests while the user was signed out. 

Improves the `usePlan` hook has been updated to not fire requests when switching organizations or when users sign in/out.
