---
"@clerk/backend": minor
---

Add Backend API support for managing instance-level organization RBAC. `createClerkClient()` now exposes:

- `organizationPermissions` — list, get, create, update, and delete organization permissions.
- `organizationRoles` — list, get, create, update, and delete organization roles, plus assign/remove a permission to/from a role.
- `roleSets` — list, get, create, update, add roles to, replace a role in, and replace a role set.
