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

export type SignInFuturePasswordParams =
  | {
      identifier: string;
      password: string;
      email?: never;
      phoneNumber?: never;
    }
  | {
      password: string;
      email: string;
      identifier?: never;
      phoneNumber?: never;
    }
  | {
      password: string;
      phoneNumber: string;
      identifier?: never;
      email?: never;
    };

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

/**
 * The current active `SignIn` instance, for use in custom flows.
 */
export interface SignInFutureResource {
  /**
   * The list of first-factor strategies that are available for the current sign-in attempt.
   */
  readonly availableStrategies: SignInFirstFactor[];

  /**
   * The status of the current sign-in attempt as a string (for example, `'needs_identifier'`, `'needs_first_factor'`,
   * `'complete'`, etc.)
   */
  readonly status: SignInStatus;

  /**
   * Indicates that there is not a matching user for the first-factor verification used, and that the sign-in can be
   * transferred to a sign-up.
   */
  readonly isTransferable: boolean;

  readonly existingSession?: { sessionId: string };

  /**
   * Used to supply an identifier for the sign-in attempt. Calling this method will populate data on the sign-in
   * attempt, such as `signIn.resource.supportedFirstFactors`.
   */
  create: (params: SignInFutureCreateParams) => Promise<{ error: unknown }>;

  /**
   * Used to submit a password to sign-in.
   */
  password: (params: SignInFuturePasswordParams) => Promise<{ error: unknown }>;

  /**
   *
   */
  emailCode: {
    /**
     * Used to send an email code to sign-in
     */
    sendCode: (params: SignInFutureEmailCodeSendParams) => Promise<{ error: unknown }>;

    /**
     * Used to verify a code sent via email to sign-in
     */
    verifyCode: (params: SignInFutureEmailCodeVerifyParams) => Promise<{ error: unknown }>;
  };

  /**
   *
   */
  phoneCode: {
    /**
     * Used to send a phone code to sign-in
     */
    sendCode: (params: SignInFuturePhoneCodeSendParams) => Promise<{ error: unknown }>;

    /**
     * Used to verify a code sent via phone to sign-in
     */
    verifyCode: (params: SignInFuturePhoneCodeVerifyParams) => Promise<{ error: unknown }>;
  };

  /**
   *
   */
  resetPasswordEmailCode: {
    /**
     * Used to send a password reset code to the first email address on the account
     */
    sendCode: () => Promise<{ error: unknown }>;

    /**
     * Used to verify a password reset code sent via email. Will cause `signIn.status` to become `'needs_new_password'`.
     */
    verifyCode: (params: SignInFutureEmailCodeVerifyParams) => Promise<{ error: unknown }>;

    /**
     * Used to submit a new password, and move the `signIn.status` to `'complete'`.
     */
    submitPassword: (params: SignInFutureResetPasswordSubmitParams) => Promise<{ error: unknown }>;
  };

  /**
   * Used to perform OAuth authentication.
   */
  sso: (params: SignInFutureSSOParams) => Promise<{ error: unknown }>;

  /**
   *
   */
  mfa: {
    /**
     * Used to send a phone code as a second factor to sign-in
     */
    sendPhoneCode: () => Promise<{ error: unknown }>;

    /**
     * Used to verify a phone code sent as a second factor to sign-in
     */
    verifyPhoneCode: (params: SignInFutureMFAPhoneCodeVerifyParams) => Promise<{ error: unknown }>;

    /**
     * Used to verify a TOTP code as a second factor to sign-in
     */
    verifyTOTP: (params: SignInFutureTOTPVerifyParams) => Promise<{ error: unknown }>;

    /**
     * Used to verify a backup code as a second factor to sign-in
     */
    verifyBackupCode: (params: SignInFutureBackupCodeVerifyParams) => Promise<{ error: unknown }>;
  };

  /**
   * Used to convert a sign-in with `status === ‘complete’` into an active session. Will cause anything observing the
   * session state (such as the `useUser()` hook) to update automatically.
   */
  finalize: (params?: SignInFutureFinalizeParams) => Promise<{ error: unknown }>;
}
