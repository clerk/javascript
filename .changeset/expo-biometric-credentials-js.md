---
'@clerk/expo': minor
---

`useBiometricCredentials()` now enrolls, lists, revokes and signs in with biometric credentials through `@clerk/expo-biometrics` and Clerk's JavaScript SDK, instead of Clerk's native iOS and Android SDKs.

- Install `@clerk/expo-biometrics` (`npx expo install @clerk/expo-biometrics`) and rebuild your development build. Without it, these methods throw an error explaining how to install it.
- Enrollment, listing, revocation and sign-in no longer depend on Clerk's native iOS and Android SDKs or require iOS 17.
- `reverify()` still uses Clerk's native SDK.
- On Android, credentials enrolled through the previous native implementation may not be found. Affected users need to enroll again.
