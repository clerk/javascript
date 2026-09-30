---
'@clerk/expo-biometrics': minor
---

Add `@clerk/expo-biometrics`, an experimental Expo native module for iOS and Android that creates and signs with the device-bound keys behind Clerk biometric credentials and manages their on-device records. `@clerk/expo`'s `useBiometricCredentials()` uses it for enrollment and sign-in.

On Android, keys live in the Android Keystore and records in the v2 biometric credential storage shared with the Clerk Android SDK. Credentials enrolled by either SDK in the same app are visible to both when the app uses a Clerk Android SDK version with that storage. `hashIdentifierHint()` and the `identifierHintSha256` field on records returned by `listRecords()` let identifier hints be matched on both platforms (Android stores only the hash).

If you try this out, make sure to pin your version as breaking changes can happen in minors.
