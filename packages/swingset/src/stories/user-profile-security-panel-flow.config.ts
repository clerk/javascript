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

export const COMPOSED_SECURITY_FLOW_CONFIG: SecurityFlowConfig = {
  ...DEFAULT_SECURITY_FLOW_CONFIG,
  backupCodesAvailable: true,
  hasBackupCodes: true,
  hasMfaPhone: true,
  requireReverification: true,
  reverificationStrategy: 'email_code',
};

export function setSecurityFlowMfaMethod(
  current: SecurityFlowConfig,
  method: 'sms' | 'authenticator',
  enabled: boolean,
): SecurityFlowConfig {
  const hasMfaPhone = method === 'sms' ? enabled : current.hasMfaPhone;
  const hasMfaAuthenticator = method === 'authenticator' ? enabled : current.hasMfaAuthenticator;
  const hasMfaMethod = hasMfaPhone || hasMfaAuthenticator;
  const removedReverificationMethod =
    !enabled && current.reverificationStrategy === (method === 'sms' ? 'phone_code' : 'totp');
  const removedLastMethodUsingBackupCodes = !hasMfaMethod && current.reverificationStrategy === 'backup_code';

  return {
    ...current,
    hasMfaPhone,
    hasMfaAuthenticator,
    hasBackupCodes: hasMfaMethod && current.hasBackupCodes,
    reverificationStrategy:
      removedReverificationMethod || removedLastMethodUsingBackupCodes ? 'email_code' : current.reverificationStrategy,
  };
}
