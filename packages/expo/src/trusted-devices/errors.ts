import {
  type BiometricCredentialError,
  type BiometricCredentialErrorCode,
  isBiometricCredentialError,
} from '../biometric-credentials/errors';

/** @deprecated Use `BiometricCredentialErrorCode` instead. */
export type TrustedDeviceErrorCode = BiometricCredentialErrorCode;

/** @deprecated Use `BiometricCredentialError` instead. */
export type TrustedDeviceError = BiometricCredentialError;

/** @deprecated Use `isBiometricCredentialError()` instead. */
export function isTrustedDeviceError(error: unknown): error is TrustedDeviceError {
  return isBiometricCredentialError(error);
}
