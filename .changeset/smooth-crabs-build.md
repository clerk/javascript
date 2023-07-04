---
'@clerk/backend': minor
---

The `clockSkewInSeconds` property is now deprecated from the `verifyJWT` options in favour of the new `clockSkewInMs` property. The old property accepted a value in milliseconds, so this change fixes the property name.