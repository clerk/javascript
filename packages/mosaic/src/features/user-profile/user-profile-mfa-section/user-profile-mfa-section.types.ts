import type { PhoneNumberResource } from '@clerk/shared/types';

import type { ClerkCall } from '../../clerk/errors';
import type { ReverificationController } from '../../reverification';

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
      enrollPhoneNumber?: (phoneNumber: string) => ClerkCall<SmsEnrollmentResult>;
      enrollSms?: (phoneId: string, code?: string) => ClerkCall<SmsEnrollmentResult>;
      resendSms?: (phoneId: string) => ClerkCall;
      createAuthenticator?: () => ClerkCall<{ secret: string; uri: string }>;
      verifyAuthenticator?: (code: string) => ClerkCall<MfaEnrollmentResult>;
      generateBackupCodes?: () => ClerkCall<readonly string[]>;
      remove: (methodId: string) => ClerkCall;
      setDefault?: (phoneId: string) => ClerkCall;
      removeReverification: ReverificationController;
      setDefaultReverification: ReverificationController;
      backupCodesReverification: ReverificationController;
      createPhoneReverification: ReverificationController;
      enrollSmsReverification: ReverificationController;
      authenticatorReverification: ReverificationController;
    };
