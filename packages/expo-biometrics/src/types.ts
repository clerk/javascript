/**
 * The local authentication policy that protects a biometric credential's private key.
 *
 * - `biometry_current_set`: requires a biometric from the currently enrolled set. Adding or removing a Face ID / Touch ID enrollment invalidates the key.
 * - `biometry_any`: requires a biometric, and survives biometric enrollment changes.
 * - `biometry_or_device_passcode`: requires biometrics to be available at creation, then accepts a biometric or the device passcode.
 */
export type BiometricCredentialPolicy = 'biometry_current_set' | 'biometry_any' | 'biometry_or_device_passcode';

export type BiometryType = 'faceID' | 'touchID' | 'opticID' | 'none';

export interface BiometricAvailability {
  /** The biometry the device supports, or `none`. */
  biometryType: BiometryType;
  /** Whether biometric authentication can be evaluated now. Key creation requires this for every policy. */
  canEvaluateBiometrics: boolean;
  /** Whether device owner authentication (biometrics or passcode) can be evaluated now. */
  canEvaluateDeviceOwner: boolean;
  /** Why biometric authentication cannot be evaluated, or `null` when it can. */
  errorCode: BiometricsErrorCode | null;
}

export interface BiometricCredentialKey {
  /** Opaque identifier of the private key. Stored in the credential record as `localKeyId`. */
  localKeyId: string;
  /** P-256 public key as a compact JWK string: `{"kty":"EC","crv":"P-256","x":"…","y":"…","alg":"ES256"}`. */
  publicKeyJwk: string;
}

/**
 * On-device metadata linking a Clerk biometric credential to its private key.
 */
export interface BiometricCredentialRecord {
  /** Server credential ID. */
  id: string;
  /** Identifier of the private key returned by `createKey()`. */
  localKeyId: string;
  /** Clerk user ID that enrolled the credential. */
  userId: string;
  /** App identifier the credential was enrolled for (see `getAppIdentifier()`). */
  appIdentifier: string;
  /** Local-only identifier hint. Normalized (trimmed, lowercased) when stored; empty values are omitted. */
  identifierHint?: string;
  policy: BiometricCredentialPolicy;
  /** Server credential creation time, in milliseconds since the Unix epoch. */
  createdAt: number;
  /** Server credential update time, in milliseconds since the Unix epoch. */
  updatedAt: number;
}

/**
 * A record read from the store. Fields written by other SDK versions are passed through unchanged.
 */
export type StoredBiometricCredentialRecord = BiometricCredentialRecord & { readonly [field: string]: unknown };

export interface SaveRecordOptions {
  /**
   * Delete every other record for the same `appIdentifier`, along with its private key, after the record is saved.
   * Set this after a successful enrollment, since the server has already replaced those credentials.
   */
  removeOtherRecordsForApp: boolean;
}

export interface InstallationMarkerResult {
  /** `true` when this is a new installation and the records left behind by a previous one were deleted. */
  wiped: boolean;
}

export type BiometricsErrorCode =
  | 'user_canceled'
  | 'system_canceled'
  | 'user_fallback'
  | 'authentication_failed'
  | 'biometry_not_available'
  | 'biometry_not_enrolled'
  | 'biometry_lockout'
  | 'passcode_not_set'
  | 'key_not_found'
  | 'key_invalidated'
  | 'key_generation_failed'
  | 'signing_failed'
  | 'storage_failed'
  | 'invalid_argument'
  | 'not_implemented'
  | 'native_module_unavailable'
  | 'unknown';
