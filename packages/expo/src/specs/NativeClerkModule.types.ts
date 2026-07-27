import type {
  TrustedDeviceAvailability,
  TrustedDevicePolicy,
  TrustedDeviceSignInResult,
} from '../trusted-devices/types';

export type NativeAuthFlowState = {
  isLoaded: boolean;
  isAuthFlowComplete: boolean;
};

export type NativeAuthFlowModule = {
  getAuthFlowState(): Promise<NativeAuthFlowState>;
};

export type NativeTrustedDevice = {
  id: string;
  object: 'trusted_device';
  platform: 'ios' | 'android' | (string & {});
  appIdentifier: string;
  name: string | null;
  algorithm: 'ES256' | (string & {});
  status: 'active' | 'revoked' | (string & {});
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
};

export type NativeTrustedDeviceModule = {
  getTrustedDeviceAvailability(id: string | null, identifierHint: string | null): Promise<TrustedDeviceAvailability>;
  listTrustedDevices(): Promise<NativeTrustedDevice[]>;
  enrollTrustedDevice(
    deviceName: string | null,
    identifierHint: string | null,
    reason: string | null,
    policy: TrustedDevicePolicy,
  ): Promise<NativeTrustedDevice>;
  revokeTrustedDevice(id: string): Promise<NativeTrustedDevice>;
  signInWithTrustedDevice(
    id: string | null,
    identifierHint: string | null,
    reason: string | null,
  ): Promise<TrustedDeviceSignInResult>;
};
