---
'@clerk/nextjs': patch
---

Fix `auth.protect()` skipping authorization checks for machine tokens. When a route accepts API keys, OAuth tokens, or M2M tokens through the `token` option, the `role`, `permission`, `feature`, `plan`, and `reverification` params and the predicate callback are now evaluated for those requests. Machine tokens carry no organization or billing context, so param-based checks respond with a 401 for them.
