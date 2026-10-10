---
'@clerk/expo': minor
'@clerk/expo-native-components': minor
---

Introduce `@clerk/expo-native-components`, a new package that the native components (`AuthView`, `UserButton`, `UserProfileView`) now require. Install it and rebuild your app.

```sh
npx expo install @clerk/expo-native-components
```

If it's missing, rendering a native component throws an error with these same steps. Imports from `@clerk/expo/native` don't change.

Apps that don't install it no longer include the Clerk iOS and Android SDKs and no longer require iOS 17. On Android, those apps also stop migrating biometric credentials enrolled with earlier versions of `@clerk/expo`, so users who weren't migrated by an earlier release need to enroll again.
