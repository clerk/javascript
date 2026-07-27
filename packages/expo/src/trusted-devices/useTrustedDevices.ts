import { errorThrower } from '../utils/errors';
import type { UseTrustedDevicesReturn } from './types';

const unsupportedAvailability = {
  isAvailable: false,
  unavailableReason: 'unsupported_platform',
} as const;

function unsupported(): never {
  return errorThrower.throw('Biometric trusted devices are currently only available on iOS and Android.');
}

function rejectUnsupported(): Promise<never> {
  return Promise.resolve().then(unsupported);
}

/**
 * Accesses biometric trusted-device enrollment and sign-in.
 *
 * Trusted devices are currently supported on iOS and Android.
 */
export function useTrustedDevices(): UseTrustedDevicesReturn {
  return {
    getAvailability: () => Promise.resolve(unsupportedAvailability),
    list: rejectUnsupported,
    enroll: rejectUnsupported,
    revoke: rejectUnsupported,
    signIn: rejectUnsupported,
  };
}
