import type { ClerkExpoBiometricsNativeModule } from './ClerkExpoBiometricsModule';
import ClerkExpoBiometrics from './ClerkExpoBiometricsModule';
import { ClerkBiometricsError, toClerkBiometricsError } from './errors';
import type {
  BiometricAvailability,
  BiometricCredentialKey,
  BiometricCredentialPolicy,
  BiometricCredentialRecord,
  InstallationMarkerResult,
  SaveRecordOptions,
  StoredBiometricCredentialRecord,
} from './types';

export { ClerkBiometricsError, isBiometricsErrorCode, isClerkBiometricsError } from './errors';
export type {
  BiometricAvailability,
  BiometricCredentialKey,
  BiometricCredentialPolicy,
  BiometricCredentialRecord,
  BiometricsErrorCode,
  BiometryType,
  InstallationMarkerResult,
  SaveRecordOptions,
  StoredBiometricCredentialRecord,
} from './types';

const POLICIES: ReadonlySet<string> = new Set<BiometricCredentialPolicy>([
  'biometry_current_set',
  'biometry_any',
  'biometry_or_device_passcode',
]);

function nativeModule(): ClerkExpoBiometricsNativeModule {
  if (!ClerkExpoBiometrics) {
    throw new ClerkBiometricsError(
      'native_module_unavailable',
      'The ClerkExpoBiometrics native module is not available. Rebuild your app with @clerk/expo-biometrics installed; it cannot run in Expo Go or on the web.',
    );
  }
  return ClerkExpoBiometrics;
}

async function callNative<T>(fn: (module: ClerkExpoBiometricsNativeModule) => Promise<T>): Promise<T> {
  const module = nativeModule();
  try {
    return await fn(module);
  } catch (error) {
    throw toClerkBiometricsError(error);
  }
}

function invalidArgument(message: string): ClerkBiometricsError {
  return new ClerkBiometricsError('invalid_argument', message);
}

function assertNonEmptyString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw invalidArgument(`${name} must be a non-empty string.`);
  }
}

function assertPolicy(value: unknown): asserts value is BiometricCredentialPolicy {
  if (typeof value !== 'string' || !POLICIES.has(value)) {
    throw invalidArgument(`policy must be one of ${[...POLICIES].join(', ')}.`);
  }
}

function assertTimestamp(value: unknown, name: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw invalidArgument(`${name} must be a non-negative number of milliseconds since the Unix epoch.`);
  }
}

function assertRecord(record: BiometricCredentialRecord): void {
  if (typeof record !== 'object' || record === null) {
    throw invalidArgument('record must be an object.');
  }
  assertNonEmptyString(record.id, 'record.id');
  assertNonEmptyString(record.localKeyId, 'record.localKeyId');
  assertNonEmptyString(record.userId, 'record.userId');
  assertNonEmptyString(record.appIdentifier, 'record.appIdentifier');
  if (record.identifierHint !== undefined && typeof record.identifierHint !== 'string') {
    throw invalidArgument('record.identifierHint must be a string when provided.');
  }
  assertPolicy(record.policy);
  assertTimestamp(record.createdAt, 'record.createdAt');
  assertTimestamp(record.updatedAt, 'record.updatedAt');
}

/**
 * Returns the identifier Clerk uses as the credential's `app_identifier` (the iOS bundle identifier).
 */
export function getAppIdentifier(): string {
  const module = nativeModule();
  try {
    return module.getAppIdentifier();
  } catch (error) {
    throw toClerkBiometricsError(error);
  }
}

/**
 * Reports which biometry the device supports and whether it can be used right now.
 */
export function getAvailability(): Promise<BiometricAvailability> {
  return callNative(module => module.getAvailability());
}

/**
 * Creates a new hardware-backed P-256 private key protected by `policy`.
 * Rejects with `secure_key_storage_unavailable` when the device has no hardware-backed key storage (see `getAvailability()`),
 * and with `biometry_not_available`, `biometry_not_enrolled`, or `biometry_lockout` when biometrics cannot be used.
 */
export async function createKey(policy: BiometricCredentialPolicy): Promise<BiometricCredentialKey> {
  assertPolicy(policy);
  return callNative(module => module.createKey(policy));
}

/**
 * Prompts for local authentication and signs the UTF-8 bytes of `clientData` with ES256.
 * Resolves with the raw `r || s` signature, base64url-encoded without padding.
 *
 * @param reason - The message shown in the authentication prompt.
 */
export async function sign(localKeyId: string, clientData: string, reason: string | null = null): Promise<string> {
  assertNonEmptyString(localKeyId, 'localKeyId');
  if (typeof clientData !== 'string') {
    throw invalidArgument('clientData must be a string.');
  }
  return callNative(module => module.sign(localKeyId, clientData, reason));
}

/**
 * Resolves whether the private key for `localKeyId` exists. Does not prompt for authentication.
 */
export async function hasKey(localKeyId: string): Promise<boolean> {
  assertNonEmptyString(localKeyId, 'localKeyId');
  return callNative(module => module.hasKey(localKeyId));
}

/**
 * Deletes the private key for `localKeyId`. Resolves when the key does not exist.
 */
export async function deleteKey(localKeyId: string): Promise<void> {
  assertNonEmptyString(localKeyId, 'localKeyId');
  return callNative(module => module.deleteKey(localKeyId));
}

/**
 * Lists every well-formed credential record on the device, for every app identifier.
 */
export async function listRecords(): Promise<StoredBiometricCredentialRecord[]> {
  const json = await callNative(module => module.listRecords());
  let records: unknown;
  try {
    records = JSON.parse(json);
  } catch (error) {
    throw new ClerkBiometricsError('storage_failed', 'The native module returned invalid record data.', {
      cause: error,
    });
  }
  if (!Array.isArray(records)) {
    throw new ClerkBiometricsError('storage_failed', 'The native module returned invalid record data.');
  }
  return records as StoredBiometricCredentialRecord[];
}

/**
 * Saves `record`, replacing any record with the same `id`. When the replaced record used a different key, that key is deleted.
 */
export async function saveRecord(record: BiometricCredentialRecord, options: SaveRecordOptions): Promise<void> {
  assertRecord(record);
  if (typeof options?.removeOtherRecordsForApp !== 'boolean') {
    throw invalidArgument('options.removeOtherRecordsForApp must be a boolean.');
  }
  const nativeRecord: BiometricCredentialRecord = {
    id: record.id,
    localKeyId: record.localKeyId,
    userId: record.userId,
    appIdentifier: record.appIdentifier,
    policy: record.policy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
  if (record.identifierHint !== undefined) {
    nativeRecord.identifierHint = record.identifierHint;
  }
  return callNative(module =>
    module.saveRecord(nativeRecord, { removeOtherRecordsForApp: options.removeOtherRecordsForApp }),
  );
}

/**
 * Deletes the private key for `localKeyId`, then every record that references it.
 * When the key cannot be deleted the records are kept and the promise rejects.
 */
export async function deleteRecord(localKeyId: string): Promise<void> {
  assertNonEmptyString(localKeyId, 'localKeyId');
  return callNative(module => module.deleteRecord(localKeyId));
}

/**
 * Detects a new installation and deletes the records and keys a previous installation of this app left in the Keychain.
 * Safe to call repeatedly. The store operations above call it before they read or write.
 */
export function ensureInstallationMarker(): Promise<InstallationMarkerResult> {
  return callNative(module => module.ensureInstallationMarker());
}
