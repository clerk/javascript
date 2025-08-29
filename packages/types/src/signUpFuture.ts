import type { SetActiveNavigate } from './clerk';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { SignUpIdentificationField, SignUpStatus } from './signUpCommon';

export interface SignUpFutureCreateParams {
  transfer?: boolean;
}

export interface SignUpFutureEmailCodeVerifyParams {
  code: string;
}

export interface SignUpFuturePasswordParams {
  emailAddress: string;
  password: string;
}

export interface SignUpFuturePhoneCodeSendParams {
  phoneNumber?: string;
  channel?: PhoneCodeChannel;
}

export interface SignUpFuturePhoneCodeVerifyParams {
  code: string;
}

export interface SignUpFutureSSOParams {
  strategy: string;
  /**
   * The URL to redirect to after the user has completed the SSO flow.
   */
  redirectUrl: string;
  /**
   * TODO @revamp-hooks: This should be handled by FAPI instead.
   */
  redirectCallbackUrl: string;
}

export interface SignUpFutureFinalizeParams {
  navigate?: SetActiveNavigate;
}

export interface SignUpFutureResource {
  status: SignUpStatus | null;
  unverifiedFields: SignUpIdentificationField[];
  isTransferable: boolean;
  existingSession?: { sessionId: string };
  create: (params: SignUpFutureCreateParams) => Promise<{ error: unknown }>;
  verifications: {
    sendEmailCode: () => Promise<{ error: unknown }>;
    verifyEmailCode: (params: SignUpFutureEmailCodeVerifyParams) => Promise<{ error: unknown }>;
    sendPhoneCode: (params: SignUpFuturePhoneCodeSendParams) => Promise<{ error: unknown }>;
    verifyPhoneCode: (params: SignUpFuturePhoneCodeVerifyParams) => Promise<{ error: unknown }>;
  };
  password: (params: SignUpFuturePasswordParams) => Promise<{ error: unknown }>;
  sso: (params: SignUpFutureSSOParams) => Promise<{ error: unknown }>;
  finalize: (params?: SignUpFutureFinalizeParams) => Promise<{ error: unknown }>;
}
