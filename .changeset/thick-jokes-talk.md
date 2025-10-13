---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

- Add experimental property `last_authenticated_at` to `SamlAccount` resource, which represents the date when the SAML account was last authenticated
- Add experimental support for `enterprise_sso` as a `strategy` param for `session.prepareFirstFactorVerification`
