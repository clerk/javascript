import type { SetActiveNavigate } from './clerk';
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

export interface SignInFutureSSOParams {
  flow?: 'auto' | 'modal';
  strategy: OAuthStrategy | 'saml' | 'enterprise_sso';
  redirectUrl: string;
  redirectUrlComplete: string;
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
  resetPasswordEmailCode: {
    sendCode: () => Promise<{ error: unknown }>;
    verifyCode: (params: SignInFutureEmailCodeVerifyParams) => Promise<{ error: unknown }>;
    submitPassword: (params: SignInFutureResetPasswordSubmitParams) => Promise<{ error: unknown }>;
  };
  sso: (params: SignInFutureSSOParams) => Promise<{ error: unknown }>;
  finalize: (params?: SignInFutureFinalizeParams) => Promise<{ error: unknown }>;
}
