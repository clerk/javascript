---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

- Introduced an `upsert` method to the `SignUp` resource, which reuses the existing sign-up attempt ID if it exists.
- Fix a ticket flow issue on `<SignUp />` component, where in some rare cases the initial ticket/context is lost, because of creating a new sign-up attempt ID.
