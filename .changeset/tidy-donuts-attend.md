---
'@clerk/backend': patch
---

Add the remaining optional enterprise connection parameters supported by the Backend API. `CreateEnterpriseConnectionParams` and `UpdateEnterpriseConnectionParams` now accept `allowOrganizationAccountLinking`, `customAttributes`, `authenticatable`, and `disableJitProvisioning` (update also accepts `disableAdditionalIdentifications`), and SAML params accept `loginHint` for configuring the `login_hint` sent to the IdP.
