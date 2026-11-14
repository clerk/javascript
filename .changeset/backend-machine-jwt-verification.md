---
'@clerk/backend': minor
---

Tighten JWT verification in `authenticateRequest()` and `verifyMachineAuthToken()`:

- Reject session tokens and machine JWTs whose `exp`, `nbf` or `iat` is not a finite number, and reject expired or not-yet-valid tokens even when the claim is beyond the range a JavaScript `Date` can represent.
- Require an OAuth access token JWT's `iss` to match the instance's Frontend API URL. `verifyMachineAuthToken()` now rejects an OAuth access token JWT when no valid `publishableKey` is passed, because the expected issuer can't be derived.
- When the JWKS for a machine JWT can't be loaded, report `secret-key-invalid` or the new `jwk-remote-failed-to-load` reason instead of `token-verification-failed`.
