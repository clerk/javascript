---
'@clerk/elements': patch
---

- Bump XState from version 5.12.0 to 5.13.0
- We now maintain your current state while completing authentication redirecting rather than transitioning to a "Complete" step.
- Fixes Sign In and Sign Up machines not appropriately attaching new form machines when returning to the Sign In or Sign Up pages.
