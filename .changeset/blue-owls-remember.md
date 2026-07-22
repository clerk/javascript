---
'@clerk/clerk-js': patch
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Add the four setup steps to the experimental OIDC self-serve SSO configuration flow, including copyable authorized and debug redirect URIs, ID-token claims, endpoint configuration, application credentials, and optional scopes. OIDC connections now expose their callback, authorization, token, and user-info endpoints.
