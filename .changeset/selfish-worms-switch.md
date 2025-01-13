---
'@clerk/clerk-expo': minor
---

Introduces support for SSO with SAML

- Rename `useOAuth` to `useSso` to support a wider range of protocols
- Update default redirect URI to from `oauth-native-callback` to `sso-native-callback`
