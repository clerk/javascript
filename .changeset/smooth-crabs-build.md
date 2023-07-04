---
'@clerk/backend': minor
---

The `clockSkewInSeconds` property is now deprecated from the `verifyJWT` options in favour of the new `clockSkewInMs` property. The old value incorrectly accepted a value in milliseconds so the behaviour will remain the same.
