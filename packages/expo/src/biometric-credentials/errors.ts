export type BiometricCredentialErrorCode =
  | 'environment_unavailable'
  | 'unsupported_platform'
  | 'biometric_authentication_unavailable'
  | 'biometric_authentication_canceled'
  | 'biometric_authentication_failed'
  | 'key_generation_failed'
  | 'key_not_found'
  | 'key_invalidated'
  | 'invalid_public_key'
  | 'public_key_export_failed'
  | 'unsupported_algorithm'
  | 'signing_failed'
  | 'key_deletion_failed'
  | 'invalid_trusted_device_policy'
  | 'E_TRUSTED_DEVICE_AVAILABILITY_FAILED'
  | 'E_TRUSTED_DEVICE_LIST_FAILED'
  | 'E_TRUSTED_DEVICE_ENROLLMENT_FAILED'
  | 'E_TRUSTED_DEVICE_REVOCATION_FAILED'
  | 'E_TRUSTED_DEVICE_SIGN_IN_FAILED'
  | (string & {});

export type BiometricCredentialError = Error & {
  code: BiometricCredentialErrorCode;
};

export function isBiometricCredentialError(error: unknown): error is BiometricCredentialError {
  return error instanceof Error && 'code' in error && typeof error.code === 'string';
}
