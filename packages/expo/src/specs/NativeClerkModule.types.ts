import type { SignInStatus } from '@clerk/shared/types';

import type { BiometricCredentialAvailability, BiometricCredentialPolicy } from '../biometric-credentials/types';

export type NativeAuthFlowState = {
  isLoaded: boolean;
  isAuthFlowComplete: boolean;
};

export type NativeAuthFlowModule = {
  getAuthFlowState(): Promise<NativeAuthFlowState>;
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
};
