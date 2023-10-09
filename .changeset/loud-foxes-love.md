---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Introduces a new `isAuthorized()` method in the `Session` class. Returns a promise and checks whether the active user is allowed to perform an action based on the passed (required) permission and the ones attached to the membership.
