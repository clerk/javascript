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

/**
 * Signs the Frontend API requests that clerk-js sends with the native SDK's device key, so the client
 * token is bound to this device. The native SDK decides whether a request is signed, from the token's
 * `cnf` claim and the state of its key.
 */
export type NativeDeviceBindingModule = {
  /** Binds the client to the device key from the next `configureNative`, when JS signs its requests. */
  setHostSignsRequests(enabled: boolean): Promise<void>;
  /**
   * Resolves the request's `DPoP` header, or null to send it unsigned. Rejects when the token is bound
   * but the key cannot sign, or before `configureNative`.
   */
  createDpopProof(method: string, url: string, authorization: string | null): Promise<string | null>;
  recordServerDate(date: string): void;
};
