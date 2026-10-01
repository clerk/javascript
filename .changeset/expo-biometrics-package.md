---
'@clerk/expo': minor
'@clerk/expo-biometrics': minor
---

Introduce `@clerk/expo-biometrics`, a new package that `useBiometricCredentials()` now requires. Install it and rebuild your app:

```sh
npx expo install @clerk/expo-biometrics
```

If it's missing, the hook throws an error with these same steps.

Import the hook from `@clerk/expo/biometrics`:

```ts
import { useBiometricCredentials } from '@clerk/expo/biometrics';
```

Importing it from `@clerk/expo` still works, but it logs a deprecation warning and will be removed in the next major version.
