import type { ClerkCall } from '../clerk/errors';
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
      enrollPhoneNumber?: (phoneNumber: string) => ClerkCall<SmsEnrollmentResult>;
      enrollSms?: (phoneId: string, code?: string) => ClerkCall<SmsEnrollmentResult>;
      resendSms?: (phoneId: string) => ClerkCall;
      createAuthenticator?: () => ClerkCall<AuthenticatorSetup>;
      verifyAuthenticator?: (code: string) => ClerkCall<MfaEnrollmentResult>;
      onComplete: () => ClerkCall;
      onSignOut: () => ClerkCall;
      createPhoneReverification: ReverificationController;
      enrollSmsReverification: ReverificationController;
      authenticatorReverification: ReverificationController;
    };
