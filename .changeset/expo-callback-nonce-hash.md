---
'@clerk/expo': patch
---

Fixed SSO sign-ins failing with a 401 `signed_out` error when the OAuth callback URL carries a stray `#` on the `rotating_token_nonce` parameter, as seen on iOS.
