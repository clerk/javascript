import type { ReverificationChallengeState } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';

export interface SecurityFlowConfig {
  latencyMs: number;
  passwordAvailable: boolean;
  hasPassword: boolean;
  passwordReadOnly: boolean;
  passwordMinimumLength: number;
  signedInIdentifier: string;
  passkeysAvailable: boolean;
  passkeyCreationAvailable: boolean;
  passkeyCapability: 'available' | 'unsupported';
  passkeyCreationResult: 'success' | 'cancelled' | 'resource-error';
  hasPasskey: boolean;
  hasMfaPhone: boolean;
  hasMfaAuthenticator: boolean;
  mfaPhoneAvailable: boolean;
  mfaAuthenticatorAvailable: boolean;
  availableMfaPhone: 'none' | 'verified' | 'unverified';
  backupCodesAvailable: boolean;
  hasBackupCodes: boolean;
  backupCodeCreationResult: 'success' | 'unavailable';
  mfaVerificationResult: 'success' | 'server-error';
  mfaRequired: boolean;
  deleteAccountAvailable: boolean;
  otherSessionsCount: number;
  devicesStatus: 'loading' | 'ready' | 'error';
  requireReverification: boolean;
  reverificationStrategy: ReverificationChallengeState['strategy'];
  failurePoint: 'none' | 'initial-request' | 'reverification' | 'retried-mutation';
  validCode: string;
  validPassword: string;
}

export const DEFAULT_SECURITY_FLOW_CONFIG: SecurityFlowConfig = {
  latencyMs: 900,
  passwordAvailable: true,
  hasPassword: true,
  passwordReadOnly: false,
  passwordMinimumLength: 8,
  signedInIdentifier: 'preston@clerk.dev',
  passkeysAvailable: true,
  passkeyCreationAvailable: true,
  passkeyCapability: 'available',
  passkeyCreationResult: 'success',
  hasPasskey: true,
  hasMfaPhone: false,
  hasMfaAuthenticator: false,
  mfaPhoneAvailable: true,
  mfaAuthenticatorAvailable: true,
  availableMfaPhone: 'none',
  backupCodesAvailable: false,
  hasBackupCodes: false,
  backupCodeCreationResult: 'success',
  mfaVerificationResult: 'success',
  mfaRequired: false,
  deleteAccountAvailable: true,
  otherSessionsCount: 0,
  devicesStatus: 'ready',
  requireReverification: false,
  reverificationStrategy: 'email_code',
  failurePoint: 'none',
  validCode: '424242',
  validPassword: 'clerk',
};
