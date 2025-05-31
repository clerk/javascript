---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

feat(types,clerk-js): Update types; RoleSelect allows fallbackLabel
- this updates OrganizationInvitation and OrganizationMembership resource+types to include `roleName` which is already present on frontend-api responses, as `role_name`.
- this updates RoleSelect to allow rendering a `fallbackLabel` in the event that `value` does not map to any of the supplied roles