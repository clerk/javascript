import type {
  BiometricCredential,
  BiometricCredentialAvailability,
  BiometricCredentialPlatform,
  BiometricCredentialPolicy,
  BiometricCredentialStatus,
  BiometricCredentialUnavailableReason,
  BiometricSignInResult,
  GetBiometricCredentialAvailabilityParams,
  SignInWithBiometricsParams,
} from '../biometric-credentials/types';

/** @deprecated Use `BiometricCredentialUnavailableReason` instead. */
export type TrustedDeviceUnavailableReason = BiometricCredentialUnavailableReason;

/** @deprecated Use `BiometricCredentialAvailability` instead. */
export type TrustedDeviceAvailability = BiometricCredentialAvailability;

/** @deprecated Use `BiometricCredentialPolicy` instead. */
export type TrustedDevicePolicy = BiometricCredentialPolicy;

/** @deprecated Use `BiometricCredentialPlatform` instead. */
export type TrustedDevicePlatform = BiometricCredentialPlatform;

/** @deprecated Use `BiometricCredentialStatus` instead. */
export type TrustedDeviceStatus = BiometricCredentialStatus;

/** @deprecated Use `BiometricCredential` instead. */
export type TrustedDevice = BiometricCredential;

/** @deprecated Use `GetBiometricCredentialAvailabilityParams` instead. */
export type GetTrustedDeviceAvailabilityParams = GetBiometricCredentialAvailabilityParams;

/** @deprecated Use `EnrollBiometricCredentialParams` with `name` instead of `deviceName`. */
export type EnrollTrustedDeviceParams = {
  deviceName?: string;
  identifierHint?: string;
  reason?: string;
  policy?: TrustedDevicePolicy;
};

/** @deprecated Use `SignInWithBiometricsParams` instead. */
export type SignInWithTrustedDeviceParams = SignInWithBiometricsParams;

/** @deprecated Use `BiometricSignInResult` instead. */
export type TrustedDeviceSignInResult = BiometricSignInResult;

/** @deprecated Use `UseBiometricCredentialsReturn` instead. */
export type UseTrustedDevicesReturn = {
  getAvailability: (params?: GetTrustedDeviceAvailabilityParams) => Promise<TrustedDeviceAvailability>;
  list: () => Promise<TrustedDevice[]>;
  enroll: (params?: EnrollTrustedDeviceParams) => Promise<TrustedDevice>;
  revoke: (id: string) => Promise<TrustedDevice>;
  signIn: (params?: SignInWithTrustedDeviceParams) => Promise<TrustedDeviceSignInResult>;
};
