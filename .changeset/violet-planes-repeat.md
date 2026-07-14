---
'@clerk/backend': patch
---

Align `CreateEnterpriseConnectionParams` and `UpdateEnterpriseConnectionParams` with the Backend API contract:

- `name` and `domains` are now required on `CreateEnterpriseConnectionParams`. The Backend API already rejected requests missing either of them, so calls that omitted these fields failed at runtime; the types now surface this at compile time.
- Deprecated `syncUserAttributes` on `CreateEnterpriseConnectionParams`. The Backend API ignores this parameter on create; use `updateEnterpriseConnection()` to set it.
- Deprecated `provider` on `UpdateEnterpriseConnectionParams`. The Backend API ignores this parameter on update; the provider cannot be changed after creation.
