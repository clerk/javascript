---
'@clerk/expo': major
'@clerk/expo-google-signin': minor
---

Native Google Sign-In has moved out of `@clerk/expo` into a new optional package, `@clerk/expo-google-signin`. Apps that don't use `useSignInWithGoogle` no longer pull in the native Google Sign-In dependencies during prebuild.

If you use native Google Sign-In, install the new package:

```sh
npx expo install @clerk/expo-google-signin
```

add its config plugin alongside `@clerk/expo` in your app config:

```json
{
  "expo": {
    "plugins": ["@clerk/expo", "@clerk/expo-google-signin"]
  }
}
```

then rebuild your native app. The `@clerk/expo/google` import path still re-exports `useSignInWithGoogle`, but it now requires `@clerk/expo-google-signin` to be installed.
