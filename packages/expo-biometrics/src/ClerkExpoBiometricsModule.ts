import { requireOptionalNativeModule } from 'expo';

import type {
  BiometricAvailability,
  BiometricCredentialKey,
  BiometricCredentialPolicy,
  BiometricCredentialRecord,
  InstallationMarkerResult,
  SaveRecordOptions,
} from './types';

export interface ClerkExpoBiometricsNativeModule {
  getAppIdentifier(): string;
  getAvailability(): Promise<BiometricAvailability>;
  createKey(policy: BiometricCredentialPolicy): Promise<BiometricCredentialKey>;
  sign(localKeyId: string, clientData: string, reason: string | null): Promise<string>;
  hasKey(localKeyId: string): Promise<boolean>;
  deleteKey(localKeyId: string): Promise<void>;
  /** JSON-encoded array of records, so fields the bridge cannot represent survive unchanged. */
  listRecords(): Promise<string>;
  saveRecord(record: BiometricCredentialRecord, options: SaveRecordOptions): Promise<void>;
  deleteRecord(localKeyId: string): Promise<void>;
  ensureInstallationMarker(): Promise<InstallationMarkerResult>;
}

export default requireOptionalNativeModule<ClerkExpoBiometricsNativeModule>('ClerkExpoBiometrics');
