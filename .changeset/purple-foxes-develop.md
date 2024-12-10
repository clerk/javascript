---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Introduced an `upsert` method to the `SignUp` resource, which reuses the existing sign-up attempt ID if it exists. This was an obvious oversight in the ticket flow, so `SignUpStart` has been updated to use this instead.
