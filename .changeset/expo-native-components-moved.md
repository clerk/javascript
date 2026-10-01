---
'@clerk/expo': minor
---

The native components (`AuthView`, `UserButton`, `UserProfileView`) and native client sync have moved to the new `@clerk/expo-native-components` package. Apps that don't install it no longer include the Clerk iOS and Android SDKs and no longer require iOS 17.

If you use the native components, install the new package:

```sh
npx expo install @clerk/expo-native-components
```

add its config plugin alongside `@clerk/expo` in your app config:

```json
{
  "expo": {
    "plugins": ["@clerk/expo", "@clerk/expo-native-components"]
  }
}
```

then rebuild your native app. `@clerk/expo/native` keeps working and re-exports the components from `@clerk/expo-native-components`, which you can also import from directly. Without `@clerk/expo-native-components` installed, rendering a component from `@clerk/expo/native` throws an error explaining how to install it.

The `keychainService` and `theme` config plugin options now belong to the `@clerk/expo-native-components` plugin. The `@clerk/expo` plugin forwards them when `@clerk/expo-native-components` is installed, and warns otherwise.

On Android, the Clerk Android SDK moves biometric credentials enrolled with earlier versions of `@clerk/expo` to the storage that `@clerk/expo-biometrics` reads. Apps without `@clerk/expo-native-components` no longer include that SDK, so users whose credentials weren't moved by an earlier release need to enroll again.
