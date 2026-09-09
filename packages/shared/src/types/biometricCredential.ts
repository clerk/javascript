export type BiometricCredentialPolicy = 'biometry_current_set' | 'biometry_any' | 'biometry_or_device_passcode';
export type BiometricCredentialUnavailableReason =
  | 'environmentUnavailable'
  | 'nativeAPIDisabled'
  | 'featureDisabled'
  | 'unsupportedPlatform'
  | 'biometricAuthenticationUnavailable'
  | 'noLocalCredential'
  | 'localKeyMissing'
  | 'serverCredentialMissing'
  | 'serverCredentialRevoked';

export interface BiometricCredentialAvailability {
  isAvailable: boolean;
  unavailableReason: BiometricCredentialUnavailableReason | null;
}
export interface BiometricCredentialSelectionParams {
  id?: string;
  identifierHint?: string;
  currentUser?: boolean;
}
export interface BiometricCredentialEnrollmentParams {
  name?: string;
  identifierHint?: string;
  reason?: string;
  promptSubtitle?: string;
  policy?: BiometricCredentialPolicy;
}
export interface SignInFutureBiometricCredentialParams {
  id?: string;
  identifierHint?: string;
  reason?: string;
  promptSubtitle?: string;
}
export interface BiometricCredential {
  id: string;
  object: string;
  platform: 'ios' | 'android' | (string & {});
  appIdentifier: string;
  name: string | null;
  algorithm: 'ES256' | (string & {});
  status: 'active' | 'revoked' | (string & {});
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}
export interface BiometricCredentialValidationResult {
  status: 'valid' | 'invalid' | 'inconclusive';
  reason: BiometricCredentialUnavailableReason | null;
}

/** Native biometric credentials, backed by device-held keys and the Clerk core. */
export interface BiometricCredentialsResource {
  readonly canEnroll: boolean;
  list: () => Promise<BiometricCredential[]>;
  availability: (params?: BiometricCredentialSelectionParams) => Promise<BiometricCredentialAvailability>;
  localAvailability: (params?: BiometricCredentialSelectionParams) => Promise<BiometricCredentialAvailability>;
  validateLocalCredential: (
    params?: BiometricCredentialSelectionParams,
  ) => Promise<BiometricCredentialValidationResult>;
  enroll: (params?: BiometricCredentialEnrollmentParams) => Promise<BiometricCredential>;
  revoke: (params: { id: string }) => Promise<BiometricCredential>;
  revokeCurrentDeviceCredential: () => Promise<BiometricCredential | null>;
  forgetLocalCredentials: (params: { userId: string }) => Promise<number>;
}
