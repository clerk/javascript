---
'@clerk/elements': patch
---

This release includes various smaller fixes and one dependency update:

- `xstate` was updated from `5.12.0` to `5.13.0`
- Previously, the contents of the `fallback` prop were sometimes shown even if the user wasn't on the `start` step. This bug is fixed now.
- Upon completion of an sign-in/sign-up attempt, don't immediately return to the `start` step. This fixes the issue of a "flash of content" that could e.g. be seen during sign-in with OAuth providers.
- Some underlying fixes in Clerk Elements' XState logic were applied to make sure that during a sign-in/sign-up attempt the state is properly maintained. For example, if you visit an already completed attempt (some step of that flow) it now properly keeps track of that state.
