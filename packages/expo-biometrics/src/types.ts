/**
 * The local authentication policy that protects a biometric credential's private key.
 *
 * - `biometry_current_set`: requires a biometric from the currently enrolled set. Adding or removing a Face ID / Touch ID enrollment invalidates the key.
 * - `biometry_any`: requires a biometric, and survives biometric enrollment changes.
 * - `biometry_or_device_passcode`: requires biometrics to be available at creation, then accepts a biometric or the device passcode.
 */
export type BiometricCredentialPolicy = 'biometry_current_set' | 'biometry_any' | 'biometry_or_device_passcode';

/**
 * The biometry the device supports. iOS reports `faceID`, `touchID`, or `opticID`. Android cannot tell which sensor is a
 * strong (Class 3) biometric, so it reports `biometric` whenever one is present.
 */
export type BiometryType = 'faceID' | 'touchID' | 'opticID' | 'biometric' | 'none';

export interface BiometricAvailability {
  /** The biometry the device supports, or `none`. */
  biometryType: BiometryType;
  /** Whether biometric authentication can be evaluated now. Key creation requires this for every policy. */
  canEvaluateBiometrics: boolean;
  /** Whether device owner authentication (biometrics or passcode) can be evaluated now. */
  canEvaluateDeviceOwner: boolean;
  /** Why biometric authentication cannot be evaluated, or `null` when it can. */
  errorCode: BiometricsErrorCode | null;
  /**
   * Whether the device has hardware-backed key storage (the Secure Enclave on iOS). `false` on the iOS Simulator.
   * `createKey()` rejects with `secure_key_storage_unavailable` when this is `false`.
   */
  secureKeyStorageAvailable: boolean;
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
  /**
   * Local-only identifier hint. Normalized (trimmed, lowercased) when stored; empty values are omitted.
   * iOS stores the normalized hint; Android stores only its hash (see `hashIdentifierHint()`).
   */
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
export type StoredBiometricCredentialRecord = Omit<BiometricCredentialRecord, 'identifierHint'> & {
  /** The normalized identifier hint on iOS, when one was stored. Always `null` on Android, which stores only the hash. */
  identifierHint?: string | null;
  /** `hashIdentifierHint()` of the stored identifier hint, or `null` when there is none. Compare hints with this field. */
  identifierHintSha256: string | null;
  readonly [field: string]: unknown;
};

export interface SaveRecordOptions {
  /**
   * Delete every other record for the same `appIdentifier`, along with its private key, after the record is saved.
   * Set this after a successful enrollment, since the server has already replaced those credentials.
   * On Android only the same `userId`'s other records are deleted, as the shared storage contract requires.
   */
  removeOtherRecordsForApp: boolean;
}

export interface InstallationMarkerResult {
  /**
   * `true` when this is a new installation and the records left behind by a previous one were deleted.
   * Always `false` on Android, where uninstalling the app already deletes its records and keys.
   */
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
  | 'secure_key_storage_unavailable'
  | 'key_not_found'
  | 'key_invalidated'
  | 'key_generation_failed'
  | 'signing_failed'
  | 'storage_failed'
  | 'invalid_argument'
  | 'not_implemented'
  | 'native_module_unavailable'
  | 'unknown';
