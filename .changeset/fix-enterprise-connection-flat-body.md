---
'@clerk/clerk-js': patch
---

Fix `toMeEnterpriseConnectionBody` to produce the flat snake_case body shape the backend expects for `user.createEnterpriseConnection` and `user.updateEnterpriseConnection`. SAML and OIDC fields are now top-level prefixed (e.g., `saml_idp_metadata_url`) rather than nested under `saml` / `oidc` objects. Without this fix, IdP metadata submission in `<__experimental_ConfigureSSO />` silently fails on the backend.
