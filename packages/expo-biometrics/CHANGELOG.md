# @clerk/expo-biometrics

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
