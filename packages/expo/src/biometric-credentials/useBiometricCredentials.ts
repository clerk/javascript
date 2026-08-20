import { errorThrower } from '../utils/errors';
import type { UseBiometricCredentialsReturn } from './types';

const unsupportedAvailability = {
  isAvailable: false,
  unavailableReason: 'unsupported_platform',
} as const;

function unsupported(): never {
  return errorThrower.throw('Biometric credentials are currently only available on iOS and Android.');
}

function rejectUnsupported(): Promise<never> {
  return Promise.resolve().then(unsupported);
}

const biometricCredentials: UseBiometricCredentialsReturn = Object.freeze({
  getAvailability: () => Promise.resolve(unsupportedAvailability),
  list: rejectUnsupported,
  enroll: rejectUnsupported,
  revoke: rejectUnsupported,
  signIn: rejectUnsupported,
});

/**
 * Accesses biometric credential enrollment and sign-in.
 *
 * Biometric credentials are currently supported on iOS and Android.
 */
export function useBiometricCredentials(): UseBiometricCredentialsReturn {
  return biometricCredentials;
}
