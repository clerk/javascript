---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

- Add `last_authenticated_at` to `SAMLAccount` resource, which represents the date when the SAML account was last authenticated
- Support `enterprise_sso` as a `strategy` param for `session.prepareFirstFactorVerification`
