---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Remove deprecated `createEnterpriseConnection`, `updateEnterpriseConnection`, and `deleteEnterpriseConnection` methods from the `User` resource in favor of `Organization` scoped ones

`ConfigureSSO` was previously the only consumer but since it hasn't been released GA yet, these changes won't break existing production clients
