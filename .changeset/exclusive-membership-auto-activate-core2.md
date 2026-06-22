---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Backport exclusive-membership auto-activation for Core 2. When the `choose-organization` session task fires for a member of an exclusive-membership organization, clerk-js now skips the org picker and auto-activates that organization. `Organization.exclusiveMembership` is now exposed on the Organization resource.
