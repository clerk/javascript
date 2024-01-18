---
'@clerk/clerk-js': patch
'@clerk/clerk-react': patch
'@clerk/types': patch
---

To better facilitate inter-package development, we've made the following changes to `Clerk` and `IsomorphicClerk`:

- `__unstable__environment` is now exposed, typed, marked as deprecated, and commented on about its internal state. (To be removed in a future release.)
- `__internal_environment` is exposed with the appropriate typing and comments about its internal state.
