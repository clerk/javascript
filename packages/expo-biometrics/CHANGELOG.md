# @clerk/expo-biometrics

## 1.1.0

### Minor Changes

- Add Expo SDK 58 support. ([#9791](https://github.com/clerk/javascript/pull/9791)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Fix iOS builds on Expo SDK 58. `@clerk/expo-biometrics` no longer fails to compile with `cannot override with a stored property 'message'`. ([#9791](https://github.com/clerk/javascript/pull/9791)) by [@wobsoriano](https://github.com/wobsoriano)

## 1.0.0

### Major Changes

- Introduce `@clerk/expo-biometrics`, a new package that `useBiometricCredentials()` now requires. Install it and rebuild your app: ([#9989](https://github.com/clerk/javascript/pull/9989)) by [@mikepitre](https://github.com/mikepitre)

  ```sh
  npx expo install @clerk/expo-biometrics
  ```

  If it's missing, the hook throws an error with these same steps.

  Import the hook from `@clerk/expo/biometrics`:

  ```ts
  import { useBiometricCredentials } from '@clerk/expo/biometrics';
  ```

  Importing it from `@clerk/expo` still works, but it logs a deprecation warning and will be removed in the next major version.
