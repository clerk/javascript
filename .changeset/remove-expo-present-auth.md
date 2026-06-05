---
'@clerk/expo': minor
---

Update Expo's beta native prebuilt components to more closely match the behavior of Clerk's native iOS and Android SDKs.

Previously, native auth and profile views relied on Expo-specific presentation behavior. `AuthView` and `UserProfileView` are now app-presented components, with dismissal handled through `onDismiss`. This also improves session synchronization between Clerk's JavaScript and native layers.

**Note:** This includes native changes, so rebuild your native app after upgrading (`expo prebuild --clean` or a new EAS build).
