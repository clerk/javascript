---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Introduces organization membership feature.

Organizations can enforce exclusive membership, limiting users to a single organization. During the `choose-organization` session task, members of such an organization are automatically activated instead of seeing the picker. `Organization.exclusiveMembership` is now exposed on the Organization resource.
