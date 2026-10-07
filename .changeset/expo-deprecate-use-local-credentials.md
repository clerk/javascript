---
'@clerk/expo': minor
---

Deprecate `useLocalCredentials()`. It will be removed in the next major version. To keep the same flow, store the credentials with [`expo-secure-store`](https://docs.expo.dev/versions/latest/sdk/securestore/) and its `requireAuthentication` option, then sign in with the stored identifier and password.
