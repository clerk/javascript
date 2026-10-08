---
'@clerk/expo': minor
'@clerk/expo-native-components': minor
---

Introduce `@clerk/expo-native-components`, a new package that the native components (`AuthView`, `UserButton`, `UserProfileView`) now require. Install it, add its config plugin next to `@clerk/expo`, and rebuild your app.

```sh
npx expo install @clerk/expo-native-components
```

```json
{
  "expo": {
    "plugins": ["@clerk/expo", "@clerk/expo-native-components"]
  }
}
```

If it's missing, rendering a native component throws an error with these same steps. Imports from `@clerk/expo/native` don't change.

Pass the `keychainService` and `theme` plugin options to the `@clerk/expo-native-components` plugin. The `@clerk/expo` plugin forwards them when the package is installed and warns when it isn't.

Apps that don't install `@clerk/expo-native-components` no longer include the Clerk iOS and Android SDKs and no longer require iOS 17. On Android, those apps also stop moving biometric credentials enrolled with earlier versions of `@clerk/expo` to the storage that `@clerk/expo-biometrics` reads. Users whose credentials weren't moved by an earlier release need to enroll again.
