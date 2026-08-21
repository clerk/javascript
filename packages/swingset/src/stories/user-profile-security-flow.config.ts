import type { ReverificationChallengeState } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';

export interface SecurityFlowConfig {
  latencyMs: number;
  passwordAvailable: boolean;
  hasPassword: boolean;
  passwordReadOnly: boolean;
  passkeysAvailable: boolean;
  passkeyCreationAvailable: boolean;
  hasPasskey: boolean;
  hasMfaPhone: boolean;
  hasMfaAuthenticator: boolean;
  mfaPhoneAvailable: boolean;
  mfaAuthenticatorAvailable: boolean;
  availableMfaPhone: 'none' | 'verified' | 'unverified';
  backupCodesAvailable: boolean;
  hasBackupCodes: boolean;
  mfaRequired: boolean;
  deleteAccountAvailable: boolean;
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
  passkeysAvailable: true,
  passkeyCreationAvailable: true,
  hasPasskey: true,
  hasMfaPhone: false,
  hasMfaAuthenticator: false,
  mfaPhoneAvailable: true,
  mfaAuthenticatorAvailable: true,
  availableMfaPhone: 'none',
  backupCodesAvailable: false,
  hasBackupCodes: false,
  mfaRequired: false,
  deleteAccountAvailable: true,
  requireReverification: false,
  reverificationStrategy: 'email_code',
  failurePoint: 'none',
  validCode: '424242',
  validPassword: 'clerk',
};
