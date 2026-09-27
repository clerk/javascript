import { useClerk } from '@clerk/react';
import { useMemo } from 'react';

import { createBiometricCredentials } from './createBiometricCredentials';
import type { UseBiometricCredentialsReturn } from './types';

/**
 * Accesses biometric credential enrollment, sign-in, and session reverification on iOS and Android.
 *
 * Enrollment and sign-in require the `@clerk/expo-biometrics` package, which keeps the private key on the device.
 * Session reverification requires the `@clerk/expo-native-components` package.
 */
export function useBiometricCredentials(): UseBiometricCredentialsReturn {
  const clerk = useClerk();
  return useMemo(() => createBiometricCredentials(clerk), [clerk]);
}
