---
'@clerk/expo': minor
---

Add iOS and Android APIs for biometric trusted-device enrollment, sign-in, availability, listing, and revocation, including structured native error codes and forward-compatible resource values. Add `useAuthViewState()` for keeping a non-dismissible root `<AuthView />` mounted through an optional trusted-device enrollment prompt, and support configuring the Face ID permission message through the Expo config plugin.

```tsx
import { useTrustedDevices } from '@clerk/expo';

export function useBiometricSignIn(identifierHint: string) {
  const { enroll, getAvailability, signIn } = useTrustedDevices();

  // Call after the user completes a normal sign-in.
  const enableBiometricSignIn = () =>
    enroll({
      identifierHint,
      reason: 'Use biometrics to sign in next time.',
    });

  // Call when the user returns to sign in.
  const signInWithBiometrics = async () => {
    const { isAvailable } = await getAvailability({ identifierHint });

    if (!isAvailable) {
      return null;
    }

    return signIn({
      identifierHint,
      reason: 'Use biometrics to sign in.',
    });
  };

  return { enableBiometricSignIn, signInWithBiometrics };
}
```
