---
'@clerk/backend': minor
---

Align the `EnterpriseConnection` response resource with what the Backend API actually returns:

- `EnterpriseConnection` now exposes `provider`, `logoPublicUrl`, `allowOrganizationAccountLinking`, `authenticatable`, `disableJitProvisioning`, and `customAttributes`.
- `EnterpriseConnectionSamlConnection` now exposes `active`, `forceAuthn`, and `loginHint`.
- `EnterpriseConnectionOauthConfig` now exposes `providerKey`, `authUrl`, `tokenUrl`, `userInfoUrl`, and `requiresPkce`.
- Deprecated properties the Backend API never returns, which were always `undefined` despite their declared types: `allowSubdomains` on `EnterpriseConnection` (use `samlConnection.allowSubdomains`), and `idpMetadata` and `syncUserAttributes` on `EnterpriseConnectionSamlConnection` (use the top-level `syncUserAttributes`).
- `organizationId` is now normalized to `null` when the Backend API omits it, matching its declared `string | null` type. Properties backed by optional API fields (for example `oauthConfig.clientId` and the SAML IdP fields) are now typed as possibly `undefined` to match runtime behavior.
