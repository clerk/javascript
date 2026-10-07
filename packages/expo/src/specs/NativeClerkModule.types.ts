import type { SessionVerificationLevel, SessionVerificationStatus } from '@clerk/shared/types';

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

export type NativeBiometricReverificationResult = {
  id: string | null;
  status: SessionVerificationStatus | (string & {});
  level: SessionVerificationLevel | (string & {});
  sessionId: string;
};

export type NativeBiometricCredentialModule = {
  reverifyWithBiometrics(
    sessionId: string,
    level: SessionVerificationLevel,
    reason: string | null,
  ): Promise<NativeBiometricReverificationResult>;
};
