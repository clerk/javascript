---
'@clerk/clerk-js': patch
---

`organization.getRoles()`, `organization.getDomains()` and `organization.getInvitations()` no longer refresh the client as a side effect.
