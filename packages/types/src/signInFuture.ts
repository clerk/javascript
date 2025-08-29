import type { SetActiveNavigate } from './clerk';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { SignInFirstFactor, SignInStatus } from './signInCommon';
import type { OAuthStrategy } from './strategies';

export interface SignInFutureCreateParams {
  identifier?: string;
  strategy?: OAuthStrategy | 'saml' | 'enterprise_sso';
  redirectUrl?: string;
  actionCompleteRedirectUrl?: string;
  transfer?: boolean;
}

export interface SignInFuturePasswordParams {
  identifier?: string;
  password: string;
}

export interface SignInFutureEmailCodeSendParams {
  email: string;
}

export interface SignInFutureEmailCodeVerifyParams {
  code: string;
}

export interface SignInFutureResetPasswordSubmitParams {
  password: string;
  signOutOfOtherSessions?: boolean;
}

export interface SignInFuturePhoneCodeSendParams {
  phoneNumber?: string;
  channel?: PhoneCodeChannel;
}

export interface SignInFuturePhoneCodeVerifyParams {
  code: string;
}

export interface SignInFutureSSOParams {
  flow?: 'auto' | 'modal';
  strategy: OAuthStrategy | 'saml' | 'enterprise_sso';
  /**
   * The URL to redirect to after the user has completed the SSO flow.
   */
  redirectUrl: string;
  /**
   * TODO @revamp-hooks: This should be handled by FAPI instead.
   */
  redirectCallbackUrl: string;
}

export interface SignInFutureMFAPhoneCodeVerifyParams {
  code: string;
}

export interface SignInFutureTOTPVerifyParams {
  code: string;
}

export interface SignInFutureBackupCodeVerifyParams {
  code: string;
}

export interface SignInFutureFinalizeParams {
  navigate?: SetActiveNavigate;
}

export interface SignInFutureResource {
  availableStrategies: SignInFirstFactor[];
  status: SignInStatus | null;
  isTransferable: boolean;
  existingSession?: { sessionId: string };
  create: (params: SignInFutureCreateParams) => Promise<{ error: unknown }>;
  password: (params: SignInFuturePasswordParams) => Promise<{ error: unknown }>;
  emailCode: {
    sendCode: (params: SignInFutureEmailCodeSendParams) => Promise<{ error: unknown }>;
    verifyCode: (params: SignInFutureEmailCodeVerifyParams) => Promise<{ error: unknown }>;
  };
  phoneCode: {
    sendCode: (params: SignInFuturePhoneCodeSendParams) => Promise<{ error: unknown }>;
    verifyCode: (params: SignInFuturePhoneCodeVerifyParams) => Promise<{ error: unknown }>;
  };
  resetPasswordEmailCode: {
    sendCode: () => Promise<{ error: unknown }>;
    verifyCode: (params: SignInFutureEmailCodeVerifyParams) => Promise<{ error: unknown }>;
    submitPassword: (params: SignInFutureResetPasswordSubmitParams) => Promise<{ error: unknown }>;
  };
  sso: (params: SignInFutureSSOParams) => Promise<{ error: unknown }>;
  mfa: {
    sendPhoneCode: () => Promise<{ error: unknown }>;
    verifyPhoneCode: (params: SignInFutureMFAPhoneCodeVerifyParams) => Promise<{ error: unknown }>;
    verifyTOTP: (params: SignInFutureTOTPVerifyParams) => Promise<{ error: unknown }>;
    verifyBackupCode: (params: SignInFutureBackupCodeVerifyParams) => Promise<{ error: unknown }>;
  };
  finalize: (params?: SignInFutureFinalizeParams) => Promise<{ error: unknown }>;
}
