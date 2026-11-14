---
'@clerk/backend': patch
---

Tighten JWT verification in `authenticateRequest()`:

- Reject session tokens and machine JWTs whose `exp`, `nbf` or `iat` is out of range or not a finite number.
- Require an OAuth access token JWT's `iss` to match the instance's Frontend API URL.
- When the JWKS for a machine JWT can't be loaded, report `secret-key-invalid` or the new `jwk-remote-failed-to-load` reason instead of `token-verification-failed`.
