---
'@clerk/clerk-js': patch
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Add three setup steps to the experimental OIDC self-serve SSO configuration flow, including a copyable authorized redirect URI, ID-token claim requirements, endpoint configuration, and application credentials. OIDC connections now expose their callback, authorization, token, and user-info endpoints.
