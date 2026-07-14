---
'@clerk/backend': patch
---

Add the required `provider` field to `CreateEnterpriseConnectionParams`. The Backend API has always required `provider` when creating an enterprise connection, so calls to `createEnterpriseConnection()` without it type-checked but failed at runtime. The parameter type now reflects the API contract.
