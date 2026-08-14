---
'@clerk/expo': minor
---

Add iOS and Android APIs for biometric trusted-device enrollment, sign-in, availability, listing, and revocation, including structured native error codes. Trusted-device sign-in synchronizes the JS client before resolving and returns the JS sign-in resource and `setActive()` so apps can continue second-factor, new-password, or client-trust steps. Add `useAuthViewState()` for keeping a non-dismissible root `<AuthView />` mounted through an optional trusted-device enrollment prompt, and support configuring the Face ID permission message through the Expo config plugin.

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

    const result = await signIn({
      identifierHint,
      reason: 'Use biometrics to sign in.',
    });

    // Continue any remaining steps through result.signIn.
    return result;
  };

  return { enableBiometricSignIn, signInWithBiometrics };
}
```
