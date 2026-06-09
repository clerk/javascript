---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Remove deprecated `createEnterpriseConnection`, `updateEnterpriseConnection`, `deleteEnterpriseConnection`, `createEnterpriseConnectionTestRun`, and `getEnterpriseConnectionTestRuns` methods from the `User` resource in favor of `Organization` scoped ones. Also removes the unused internal `__internal_useEnterpriseConnectionTestRuns` hook.

`ConfigureSSO` was previously the only consumer but since it hasn't been released GA yet, these changes won't break existing production clients
