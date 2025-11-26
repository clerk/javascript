---
'@clerk/clerk-js': patch
---

Fix issue where `SignIn` and `SignUp` instances were unable to be serialized with `JSON.stringify` due to a circular reference.
