---
'@clerk/expo-passkeys': minor
'@clerk/expo': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add a `preferImmediatelyAvailableCredentials` option to `signIn.authenticateWithPasskey()` and `signIn.passkey()`. In Expo apps on iOS and Android, it limits passkey sign-in to passkeys already on the device. When there are none, the request fails with `passkey_registration_cancelled` and the system's "use a passkey from another device" sheet doesn't appear, so an app can prompt for a passkey automatically on sign-in. Browsers ignore it.
