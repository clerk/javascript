---
'@clerk/nextjs': patch
---

Fix `auth.protect()` skipping authorization checks for machine tokens. When a route accepts API keys, OAuth tokens, or M2M tokens through the `token` option, `auth.protect()` now evaluates the `role`, `permission`, `feature`, `plan`, and `reverification` params and the predicate callback for those requests instead of letting every authenticated machine token through. Machine tokens carry no organization or billing context, so param-based checks respond with a 401 for them. The predicate overload now also infers its return type from the `token` option.
