---
'@clerk/clerk-js': patch
---

Fixes stale `SignIn` object on `authenticateWithRedirect` for `saml` and `enterprise_sso` custom flows

Previously, the same connection identifier would be used on every `authenticateWithRedirect` call leading to redirecting to the wrong identity provider
