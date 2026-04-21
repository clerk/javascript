---
"@clerk/shared": patch
"@clerk/clerk-js": patch
"@clerk/nextjs": patch
---

Fix an authorization bypass in `has()`, `auth.protect()`, and related predicates when a single call combined conditions from more than one dimension (for example, `{ permission, reverification }` or `{ feature, permission }`). A dimension that should have denied the request was treated as indeterminate and ignored by the combining logic, allowing other passing dimensions to carry the result and authorize the call when it should have failed closed.

Behavior is now:

- When a requested dimension cannot be satisfied because the underlying session data is missing, malformed, or invalid, the call denies. Previously these cases were treated as indeterminate and ignored, which could let another passing dimension carry the call.
- Fixed a minor bug where `session.checkAuthorization()` was building authorization options from the membership row id instead of the organization id.

Single-condition role, permission, feature, and plan checks (`has({ permission })`, etc.) are unchanged. Single-condition `reverification` checks are unchanged on well-formed session data; calls with a missing or malformed `factorVerificationAge` payload now deny where they previously returned indeterminate. Callback-form `auth.protect(has => ...)` is unaffected unless the callback itself invokes the affected shapes.

Separately, `auth.protect()` in `@clerk/nextjs` previously discarded authorization params (`role`, `permission`, `feature`, `plan`, `reverification`) whenever the same argument object also contained `unauthenticatedUrl`, `unauthorizedUrl`, or `token`. TypeScript's excess-property check caught this for inline object literals but did not apply once the argument was assigned to a variable, spread, or used from JavaScript. Mixed-shape calls like `auth.protect({ role: 'org:admin', unauthorizedUrl: '/denied' })` or `auth.protect({ permission: 'org:X', token: 'session_token' })` now correctly enforce the authorization check instead of silently letting every authenticated caller through.
