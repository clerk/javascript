---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add `EnterpriseConnection` resource

`User.getEnterpriseConnections()` was wrongly typed as returning `EnterpriseAccountConnectionResource[]`, it now returns `EnterpriseConnectionResource[]`
