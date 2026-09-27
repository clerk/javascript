---
'@clerk/expo': minor
---

`useBiometricCredentials()` now enrolls, lists, revokes and signs in with biometric credentials through `@clerk/expo-biometrics` and Clerk's JavaScript SDK, instead of Clerk's native iOS and Android SDKs.

- Install `@clerk/expo-biometrics` (`npx expo install @clerk/expo-biometrics`) and rebuild your development build. Without it, these methods throw an error explaining how to install it.
- Enrollment, listing, revocation and sign-in no longer require `@clerk/expo-native-components` or iOS 17.
- `reverify()` still uses Clerk's native SDK and requires `@clerk/expo-native-components`.
- Errors returned by Clerk's API are now thrown as `ClerkAPIResponseError`, like the rest of `@clerk/expo`. Read the API error code from `error.errors[0].code`. Errors raised on the device, such as `biometric_authentication_canceled` or `key_invalidated`, keep their `code`.
- On Android, credentials enrolled through the previous native implementation may not be found by apps that don't use `@clerk/expo-native-components`. Users of those apps need to enroll again.
