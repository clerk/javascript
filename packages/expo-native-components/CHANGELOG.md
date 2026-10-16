# @clerk/expo-native-components

## 0.2.0

### Minor Changes

- Add Expo SDK 58 support. ([#9791](https://github.com/clerk/javascript/pull/9791)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Fix Android builds on Expo SDK 58. Compiling `@clerk/expo-native-components` no longer fails with `Unresolved reference 'LocalSavedStateRegistryOwner'`. ([#9791](https://github.com/clerk/javascript/pull/9791)) by [@wobsoriano](https://github.com/wobsoriano)

- Apply the Clerk theme to custom user-profile page backgrounds and navigation bars on iOS. ([#10272](https://github.com/clerk/javascript/pull/10272)) by [@juliusmarminge](https://github.com/juliusmarminge)

## 0.1.1

### Patch Changes

- Bump the bundled `clerk-android` SDK (`clerk-android-api` and `clerk-android-ui`) from `1.1.11` to `1.2.1`. See the Clerk Android release: https://github.com/clerk/clerk-android/releases/tag/v1.2.1. ([#10250](https://github.com/clerk/javascript/pull/10250)) by [@clerk-cookie](https://github.com/clerk-cookie)

- Native components now respect the `proxyUrl` passed to `<ClerkProvider>` and route Frontend API requests through the configured proxy. Applying the proxy requires a new app binary; a JS-only OTA update safely keeps the previous behavior. ([#9373](https://github.com/clerk/javascript/pull/9373)) by [@wobsoriano](https://github.com/wobsoriano)

## 0.1.0

### Minor Changes

- Introduce `@clerk/expo-native-components`, a new package that the native components (`AuthView`, `UserButton`, `UserProfileView`) now require. Install it and rebuild your app. ([#9955](https://github.com/clerk/javascript/pull/9955)) by [@mikepitre](https://github.com/mikepitre)

  ```sh
  npx expo install @clerk/expo-native-components
  ```

  If it's missing, rendering a native component throws an error with these same steps. Install the package before you ship this version in an over-the-air update, because the error is thrown at runtime and not at build time.

  Import the native components and their hooks from `@clerk/expo/native-components`. `@clerk/expo/native` is deprecated. It still works and logs a warning in development.

  Apps that don't install the package no longer include the Clerk iOS and Android SDKs and no longer require iOS 17. On Android, those apps also stop migrating biometric credentials enrolled with earlier versions of `@clerk/expo`, so users who weren't migrated by an earlier release need to enroll again.
