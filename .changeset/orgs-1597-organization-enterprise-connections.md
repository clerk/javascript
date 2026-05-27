---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add organization-scoped enterprise connection methods on the `Organization` resource: `getEnterpriseConnections`, `createEnterpriseConnection`, `updateEnterpriseConnection`, `deleteEnterpriseConnection`, `createEnterpriseConnectionTestRun`, and `getEnterpriseConnectionTestRuns`. These hit `/v1/organizations/{org_id}/enterprise_connections/*` and share the same flattened SAML/OIDC request body shape as the existing `User.*` equivalents.

Renames the parameter types from `Me*` to `Organization*`:
- `CreateOrganizationEnterpriseConnectionParams`
- `UpdateOrganizationEnterpriseConnectionParams`
- `OrganizationEnterpriseConnectionProvider`
- `OrganizationEnterpriseConnectionSamlInput`
- `OrganizationEnterpriseConnectionOidcInput`

The previous `Me*` names remain available as `@deprecated` aliases for backwards compatibility.
