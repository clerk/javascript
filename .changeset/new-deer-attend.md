---
'@clerk/shared': patch
'@clerk/types': patch
---

The `SAML_IDPS` export was moved from `@clerk/types` to `@clerk/shared/saml` and was marked as deprecated.

Please use `import { SAML_IDPS } from "@clerk/shared/saml"` instead.