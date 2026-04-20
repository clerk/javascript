---
"@clerk/shared": patch
"@clerk/clerk-js": patch
---

Fix an authorization bypass in `has()`, `auth.protect()`, and related predicates when a single call combined conditions from more than one dimension (for example, `{ permission, reverification }` or `{ feature, permission }`). A dimension that should have denied the request was treated as indeterminate and ignored by the combining logic, allowing other passing dimensions to carry the result and authorize the call when it should have failed closed.

Behavior is now:

- Every requested dimension must be individually satisfied. Combining an organization and a billing check requires both to pass (AND). Same for any combination of `role`, `permission`, `feature`, `plan`, and `reverification`.
- If a requested dimension cannot be satisfied because the underlying session data is missing, malformed, or invalid, the call denies.
- `has({})` continues to return `false`.
- `strict_mfa` (and any `multi_factor` level) now fails closed when the user has no second factor enrolled. Previously it silently downgraded to a first-factor check.
- `session.checkAuthorization()` now uses the active organization's id (not the membership row id) when building the authorization options.

Single-condition checks (`has({ permission })`, `has({ reverification })`, and so on) continue to work as before. Callback-form `auth.protect(has => ...)` is unaffected unless the callback itself invokes the affected multi-key shapes.
