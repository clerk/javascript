---
'@clerk/backend': patch
---

Add EnterpriseAccount and EnterpriseAccountConnection classes to @clerk/backend, restoring enterprise SSO account data on the User object that was lost when samlAccounts was removed in v3.
