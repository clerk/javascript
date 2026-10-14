# @clerk/expo-native-components

## 0.1.0

### Minor Changes

- Introduce `@clerk/expo-native-components`, a new package that the native components (`AuthView`, `UserButton`, `UserProfileView`) now require. Install it and rebuild your app. ([#9955](https://github.com/clerk/javascript/pull/9955)) by [@mikepitre](https://github.com/mikepitre)

  ```sh
  npx expo install @clerk/expo-native-components
  ```

  If it's missing, rendering a native component throws an error with these same steps. Install the package before you ship this version in an over-the-air update, because the error is thrown at runtime and not at build time.

  Import the native components and their hooks from `@clerk/expo/native-components`. `@clerk/expo/native` is deprecated. It still works and logs a warning in development.

  Apps that don't install the package no longer include the Clerk iOS and Android SDKs and no longer require iOS 17. On Android, those apps also stop migrating biometric credentials enrolled with earlier versions of `@clerk/expo`, so users who weren't migrated by an earlier release need to enroll again.
