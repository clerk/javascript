---
'@clerk/ui': minor
'@clerk/shared': minor
---

`<ConfigureSSO />` now calls the org-scoped enterprise connections endpoints via `organization.*EnterpriseConnection*` methods. Previously, the wizard called `user.*EnterpriseConnection*` against the `/me/*` paths.

Adds two new internal hooks in `@clerk/shared/react`, mirroring the user-scoped variants:
- `__internal_useOrganizationEnterpriseConnections`
- `__internal_useOrganizationEnterpriseConnectionTestRuns`

The existing `__internal_useUserEnterpriseConnections` and `__internal_useEnterpriseConnectionTestRuns` hooks remain available as `@deprecated` aliases.
