---
'@clerk/backend': patch
---

Add the required `provider` field to `CreateEnterpriseConnectionParams`. The Backend API has always required `provider` when creating an enterprise connection, so calls to `createEnterpriseConnection()` without it type-checked but failed at runtime. The field is typed to the supported provider values (`'saml_custom'`, `'saml_okta'`, `'saml_google'`, `'saml_microsoft'`, `'oidc_custom'`, `'oidc_github_enterprise'`, `'oidc_gitlab'`), so unsupported values are also caught at compile time.
