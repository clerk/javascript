---
"@clerk/vue": patch
---

Deprecate the `signOutOptions` prop on `<SignOutButton />` in favor of top-level `redirectUrl` and `sessionId` props. The `signOutOptions` prop still works but now emits a deprecation warning.
