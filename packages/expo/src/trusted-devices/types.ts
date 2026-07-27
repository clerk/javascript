import type { SignInStatus } from '@clerk/shared/types';

export type TrustedDeviceUnavailableReason =
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

export type TrustedDeviceAvailability = {
  isAvailable: boolean;
  unavailableReason: TrustedDeviceUnavailableReason | null;
};

export type TrustedDevicePolicy = 'biometry_current_set' | 'biometry_any' | 'biometry_or_device_passcode';

export type TrustedDevicePlatform = 'ios' | 'android' | (string & {});

export type TrustedDeviceStatus = 'active' | 'revoked' | (string & {});

export type TrustedDevice = {
  id: string;
  object: 'trusted_device';
  platform: TrustedDevicePlatform;
  appIdentifier: string;
  name: string | null;
  algorithm: 'ES256' | (string & {});
  status: TrustedDeviceStatus;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
};

export type GetTrustedDeviceAvailabilityParams = {
  id?: string;
  identifierHint?: string;
};

export type EnrollTrustedDeviceParams = {
  deviceName?: string;
  identifierHint?: string;
  reason?: string;
  policy?: TrustedDevicePolicy;
};

export type SignInWithTrustedDeviceParams = {
  id?: string;
  identifierHint?: string;
  reason?: string;
};

export type TrustedDeviceSignInResult = {
  status: SignInStatus | (string & {});
  createdSessionId: string | null;
};

export type UseTrustedDevicesReturn = {
  getAvailability: (params?: GetTrustedDeviceAvailabilityParams) => Promise<TrustedDeviceAvailability>;
  list: () => Promise<TrustedDevice[]>;
  enroll: (params?: EnrollTrustedDeviceParams) => Promise<TrustedDevice>;
  revoke: (id: string) => Promise<TrustedDevice>;
  signIn: (params?: SignInWithTrustedDeviceParams) => Promise<TrustedDeviceSignInResult>;
};
