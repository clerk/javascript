import type { SessionVerificationLevel, SessionVerificationStatus, SignInStatus } from '@clerk/shared/types';

import type { BiometricCredentialAvailability, BiometricCredentialPolicy } from '../biometric-credentials/types';

export type NativeAuthFlowState = {
  isLoaded: boolean;
  isAuthFlowComplete: boolean;
};

export type NativeAuthFlowModule = {
  getAuthFlowState(): Promise<NativeAuthFlowState>;
};

/**
 * Native storage owns the device token. JS reads it before each FAPI request, writes rotated tokens
 * back with compare-and-set, and refetches its own client on `clerkNativeClientInvalidated`.
 */
export type NativeClientSyncModule = {
  configureNative(publishableKey: string, seedDeviceToken: string | null): Promise<void>;
  getDeviceToken(): Promise<string | null>;
  setDeviceToken(token: string | null, expected: string | null): Promise<boolean>;
  refreshClient(): Promise<void>;
};

export type NativeBiometricCredential = {
  id: string;
  object: 'trusted_device';
  platform: string;
  appIdentifier: string;
  name: string | null;
  algorithm: 'ES256' | (string & {});
  status: string;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
};

export type NativeBiometricSignInResult = {
  id: string;
  status: SignInStatus | (string & {});
  createdSessionId: string | null;
};

export type NativeBiometricReverificationResult = {
  id: string | null;
  status: SessionVerificationStatus | (string & {});
  level: SessionVerificationLevel | (string & {});
  sessionId: string;
};

export type NativeBiometricCredentialModule = {
  getTrustedDeviceAvailability(
    id: string | null,
    identifierHint: string | null,
  ): Promise<BiometricCredentialAvailability>;
  listTrustedDevices(): Promise<NativeBiometricCredential[]>;
  enrollTrustedDevice(
    deviceName: string | null,
    identifierHint: string | null,
    reason: string | null,
    policy: BiometricCredentialPolicy,
  ): Promise<NativeBiometricCredential>;
  revokeTrustedDevice(id: string): Promise<NativeBiometricCredential>;
  signInWithTrustedDevice(
    id: string | null,
    identifierHint: string | null,
    reason: string | null,
  ): Promise<NativeBiometricSignInResult>;
  reverifyWithBiometrics(
    sessionId: string,
    level: SessionVerificationLevel,
    reason: string | null,
  ): Promise<NativeBiometricReverificationResult>;
};
