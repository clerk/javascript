import type { ReverificationController } from '../reverification';
import type {
  MfaEnrollmentResult,
  MfaPhone,
  SmsEnrollmentResult,
} from '../user-profile/user-profile-mfa-section/user-profile-mfa-section.types';

export type TaskSetupMfaMethod = 'authenticator' | 'sms';

export type TaskSetupMfaStep = 'select' | TaskSetupMfaMethod | 'success' | 'verify';

export interface AuthenticatorSetup {
  secret: string;
  uri: string;
}

export type TaskSetupMfaModel =
  | { status: 'loading' }
  | { status: 'unavailable'; onLeave: () => void }
  | {
      status: 'ready';
      userId: string;
      sessionId: string;
      isOnTask: boolean;
      onLeave: () => void;
      renderBranding: boolean;
      applicationName: string;
      identifier: string;
      methods: readonly TaskSetupMfaMethod[];
      phones: readonly MfaPhone[];
      enrollPhoneNumber?: (phoneNumber: string) => Promise<SmsEnrollmentResult>;
      enrollSms?: (phoneId: string, code?: string) => Promise<SmsEnrollmentResult>;
      resendSms?: (phoneId: string) => Promise<void>;
      createAuthenticator?: () => Promise<AuthenticatorSetup>;
      verifyAuthenticator?: (code: string) => Promise<MfaEnrollmentResult>;
      onComplete: () => Promise<void>;
      onSignOut: () => Promise<void>;
      createPhoneReverification: ReverificationController;
      enrollSmsReverification: ReverificationController;
      authenticatorReverification: ReverificationController;
    };
