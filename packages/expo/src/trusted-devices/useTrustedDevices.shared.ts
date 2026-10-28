import { deprecated } from '@clerk/shared/deprecated';
import { useMemo } from 'react';

import { useBiometricCredentials } from '../biometric-credentials/useBiometricCredentials.shared';
import { toTrustedDevices } from './compatibility';
import type { UseTrustedDevicesReturn } from './types';

/**
 * @deprecated Use `useBiometricCredentials()` instead. This hook will be removed in the next major version.
 */
export function useTrustedDevices(): UseTrustedDevicesReturn {
  deprecated('useTrustedDevices', 'Use `useBiometricCredentials()` instead.');
  const biometricCredentials = useBiometricCredentials();
  return useMemo(() => toTrustedDevices(biometricCredentials), [biometricCredentials]);
}
