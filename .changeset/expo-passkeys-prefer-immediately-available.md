---
'@clerk/expo-passkeys': minor
'@clerk/expo': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add a `preferImmediatelyAvailableCredentials` option to `signIn.authenticateWithPasskey()` and `signIn.passkey()`. With `@clerk/expo-passkeys` on iOS 16+ and Android, it limits sign-in to passkeys already on the device, and the request fails without showing the "use a passkey from another device" sheet when there are none. This lets an app prompt for a passkey automatically when its sign-in screen opens. Browsers ignore it.
