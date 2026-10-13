---
'@clerk/nextjs': patch
---

Fix `auth.protect()` skipping authorization checks for machine tokens. The `role`, `permission`, `feature`, `plan`, and `reverification` params and the predicate callback are now evaluated for API key, OAuth token, and M2M token requests. Param-based checks respond with a 401 for those requests.
