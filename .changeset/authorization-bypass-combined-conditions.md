---
"@clerk/shared": patch
"@clerk/backend": patch
"@clerk/clerk-js": patch
"@clerk/nextjs": patch
---

Fix an authorization bypass in `has()`, `auth.protect()`, and related predicates when a single call combined conditions from more than one dimension (for example, `{ permission, reverification }` or `{ feature, permission }`). A dimension that should have denied the request was treated as indeterminate and ignored by the combining logic, allowing other passing dimensions to carry the result and authorize the call when it should have failed closed.

Behavior is now:

- Every requested dimension must be individually satisfied. Combining an organization and a billing check requires both to pass (AND). Same for any combination of `role`, `permission`, `feature`, `plan`, and `reverification`.
- If a requested dimension cannot be satisfied because the underlying session data is missing, malformed, or invalid, the call denies.
- `has({})` continues to return `false`.
- `strict_mfa` (and any `multi_factor` level) now fails closed when the user has no second factor enrolled. Previously it silently downgraded to a first-factor check.
- `session.checkAuthorization()` now uses the active organization's id (not the membership row id) when building the authorization options.

Single-condition role, permission, feature, and plan checks (`has({ permission })`, etc.) are unchanged. The one exception is `has({ reverification: 'strict_mfa' })` (and any `multi_factor` level) on users without a second factor enrolled, which now denies instead of silently downgrading - see the bullet above. Callback-form `auth.protect(has => ...)` is unaffected unless the callback itself invokes the affected shapes.

Separately, `auth.protect()` in `@clerk/nextjs` previously discarded authorization params (`role`, `permission`, `feature`, `plan`, `reverification`) whenever the same argument object also contained `unauthenticatedUrl`, `unauthorizedUrl`, or `token`. TypeScript's excess-property check caught this for inline object literals but did not apply once the argument was assigned to a variable, spread, or used from JavaScript. Mixed-shape calls like `auth.protect({ role: 'org:admin', unauthorizedUrl: '/denied' })` or `auth.protect({ permission: 'org:X', token: 'session_token' })` now correctly enforce the authorization check instead of silently letting every authenticated caller through.
