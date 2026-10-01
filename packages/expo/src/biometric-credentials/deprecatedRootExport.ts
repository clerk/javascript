import { deprecated } from '@clerk/shared/deprecated';

import type { UseBiometricCredentialsReturn } from './types';
import { useBiometricCredentials as useBiometricCredentialsBase } from './useBiometricCredentials';

/**
 * @deprecated Import `useBiometricCredentials` from `@clerk/expo/biometrics` instead. This export will be removed in the next major version.
 */
export function useBiometricCredentials(): UseBiometricCredentialsReturn {
  deprecated('useBiometricCredentials from `@clerk/expo`', 'Import it from `@clerk/expo/biometrics` instead.');
  return useBiometricCredentialsBase();
}
