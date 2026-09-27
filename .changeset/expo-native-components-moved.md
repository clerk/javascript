---
'@clerk/expo': minor
---

The native components (`AuthView`, `UserButton`, `UserProfileView`), the native module behind biometric credentials, and native client sync have moved to the new `@clerk/expo-native` package. Apps that don't install it no longer include the Clerk iOS and Android SDKs and no longer require iOS 17.

If you use the native components or `useBiometricCredentials()`, install the new package:

```sh
npx expo install @clerk/expo-native
```

add its config plugin alongside `@clerk/expo` in your app config:

```json
{
  "expo": {
    "plugins": ["@clerk/expo", "@clerk/expo-native"]
  }
}
```

then rebuild your native app. `@clerk/expo/native` keeps working and re-exports the components from `@clerk/expo-native`, which you can also import from directly. Without `@clerk/expo-native` installed, rendering a component from `@clerk/expo/native` throws an error explaining how to install it.

The `keychainService` and `theme` config plugin options now belong to the `@clerk/expo-native` plugin. The `@clerk/expo` plugin forwards them when `@clerk/expo-native` is installed, and warns otherwise.
