export type NativeAuthFlowState = {
  isLoaded: boolean;
  isAuthFlowComplete: boolean;
};

export type NativeAuthFlowModule = {
  getAuthFlowState(): Promise<NativeAuthFlowState>;
};

export type NativeUpdateRequiredViewModule = {
  setUpdateRequiredViewEnabled(enabled: boolean): Promise<void>;
};

/**
 * Native storage owns the device token. JS reads it before each FAPI request, writes rotated tokens
 * back with compare-and-set, and refetches its own client on `clerkNativeClientInvalidated`.
 */
export type NativeClientSyncModule = {
  configureNative(publishableKey: string, seedDeviceToken: string | null, proxyUrl: string | null): Promise<void>;
  getDeviceToken(): Promise<string | null>;
  setDeviceToken(token: string | null, expected: string | null): Promise<boolean>;
  refreshClient(): Promise<void>;
};
