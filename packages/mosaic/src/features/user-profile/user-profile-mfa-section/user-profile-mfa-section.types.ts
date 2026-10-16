import type { PhoneNumberResource } from '@clerk/shared/types';

export interface UserProfileMfaMethod {
  id: string;
  type: 'sms' | 'authenticator' | 'backup-codes';
  label?: string;
  description?: string;
  isDefault?: boolean;
  canRemove?: boolean;
  canSetDefault?: boolean;
}

export type UserProfileMfaAddableMethod = 'sms' | 'authenticator' | 'backup-codes';

export interface MfaPhone extends Pick<PhoneNumberResource, 'id' | 'phoneNumber'> {
  verified: boolean;
}

export interface MfaEnrollmentResult {
  backupCodes: readonly string[];
}

export type SmsEnrollmentResult =
  | { status: 'needsVerification'; phone: MfaPhone }
  | ({ status: 'complete' } & MfaEnrollmentResult);

export type UserProfileMfaModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      userId: string;
      sessionId: string;
      applicationName: string;
      identifier: string;
      methods: readonly UserProfileMfaMethod[];
      addableMethods: readonly UserProfileMfaAddableMethod[];
      phones: readonly MfaPhone[];
      findOrCreatePhone?: (phoneNumber: string) => Promise<MfaPhone>;
      enrollSms?: (phoneId: string, code?: string) => Promise<SmsEnrollmentResult>;
      resendSms?: (phoneId: string) => Promise<void>;
      createAuthenticator?: () => Promise<{ secret: string; uri: string }>;
      verifyAuthenticator?: (code: string) => Promise<MfaEnrollmentResult>;
      generateBackupCodes?: () => Promise<readonly string[]>;
      remove: (methodId: string) => Promise<void>;
      setDefault?: (phoneId: string) => Promise<void>;
    };
