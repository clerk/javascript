# @clerk/expo-google-signin

## 1.0.0

### Major Changes

- The native Google Sign-In module has moved out of `@clerk/expo` into a new optional package, `@clerk/expo-google-signin`. Apps that don't use `useSignInWithGoogle` no longer pull in the native Google Sign-In dependencies during prebuild. ([#9015](https://github.com/clerk/javascript/pull/9015)) by [@wobsoriano](https://github.com/wobsoriano)

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

  then rebuild your native app. The `useSignInWithGoogle` hook is still exported from `@clerk/expo/google` and its API is unchanged; it now requires `@clerk/expo-google-signin` to provide the native module, and throws an actionable error if it is missing.
