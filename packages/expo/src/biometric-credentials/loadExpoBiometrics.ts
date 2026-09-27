import type * as ExpoBiometrics from '@clerk/expo-biometrics';

export type ExpoBiometricsRecord = ExpoBiometrics.StoredBiometricCredentialRecord & {
  identifierHintSha256?: string | null;
};

export type ExpoBiometricsModule = Omit<typeof ExpoBiometrics, 'listRecords'> & {
  listRecords(): Promise<ExpoBiometricsRecord[]>;
  hashIdentifierHint?: (identifierHint: string) => string | null;
};

export function loadExpoBiometrics(): ExpoBiometricsModule | null {
  try {
    // Synchronous require() in try/catch so Metro treats @clerk/expo-biometrics as an optional dependency.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@clerk/expo-biometrics') as ExpoBiometricsModule;
  } catch {
    return null;
  }
}
