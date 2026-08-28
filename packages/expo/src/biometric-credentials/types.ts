import type { SetActive, SignInResource, SignInStatus } from '@clerk/shared/types';

export type BiometricCredentialUnavailableReason =
  | 'environment_unavailable'
  | 'native_api_disabled'
  | 'feature_disabled'
  | 'unsupported_platform'
  | 'biometric_authentication_unavailable'
  | 'no_local_credential'
  | 'local_key_missing'
  | 'server_credential_missing'
  | 'server_credential_revoked'
  | (string & {});

export type BiometricCredentialAvailability = {
  isAvailable: boolean;
  unavailableReason: BiometricCredentialUnavailableReason | null;
};

export type BiometricCredentialPolicy = 'biometry_current_set' | 'biometry_any' | 'biometry_or_device_passcode';

export type BiometricCredentialPlatform = 'ios' | 'android' | 'unknown';

export type BiometricCredentialStatus = 'active' | 'revoked' | 'unknown';

export type BiometricCredential = {
  id: string;
  object: 'trusted_device';
  platform: BiometricCredentialPlatform;
  appIdentifier: string;
  name: string | null;
  algorithm: 'ES256' | (string & {});
  status: BiometricCredentialStatus;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
};

export type GetBiometricCredentialAvailabilityParams = {
  id?: string;
  identifierHint?: string;
};

export type EnrollBiometricCredentialParams = {
  name?: string;
  identifierHint?: string;
  reason?: string;
  policy?: BiometricCredentialPolicy;
};

export type SignInWithBiometricsParams = {
  id?: string;
  identifierHint?: string;
  reason?: string;
};

export type BiometricSignInResult = {
  status: SignInStatus | (string & {});
  createdSessionId: string | null;
  /** The synchronized JS sign-in resource used to continue any remaining authentication steps. */
  signIn: SignInResource;
  /** Activates a session after the sign-in reaches `complete`. */
  setActive: SetActive;
};

export type UseBiometricCredentialsReturn = {
  getAvailability: (params?: GetBiometricCredentialAvailabilityParams) => Promise<BiometricCredentialAvailability>;
  list: () => Promise<BiometricCredential[]>;
  enroll: (params?: EnrollBiometricCredentialParams) => Promise<BiometricCredential>;
  revoke: (id: string) => Promise<BiometricCredential>;
  signIn: (params?: SignInWithBiometricsParams) => Promise<BiometricSignInResult>;
};
