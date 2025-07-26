---
'@clerk/backend': minor
---

Deprecate "Personal Account" semantics in favor of "Personal Workspace"

- Deprecate `OrganizationSyncOptions['personalAccountPatterns']` in favor of `OrganizationSyncOptions['personalWorkspacePatterns']`
- Deprecate `OrganizationSyncTarget['type']` of `personalAccount` in favor of `personalWorkspace`
