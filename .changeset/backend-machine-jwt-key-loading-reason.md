---
'@clerk/backend': patch
---

Report why the signing key could not be loaded when verifying OAuth access token and M2M JWTs. When `authenticateRequest()` cannot load the JWKS for a machine JWT, the error now says so instead of reporting `token-verification-failed`: an invalid secret key keeps the `secret-key-invalid` reason, and a JWKS request that fails, returns a non-2xx response, or returns an unreadable error body reports the new `jwk-remote-failed-to-load` reason (`MachineTokenVerificationErrorCode.RemoteJWKFailedToLoad`). Use these reasons to tell a configuration problem or an outage apart from an invalid token. Invalid signatures, unknown `kid` values and claim failures still report `token-verification-failed`.
