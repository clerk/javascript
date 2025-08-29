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

/**
 * The current active `SignUp` instance, for use in custom flows.
 */
export interface SignUpFutureResource {
  /**
   * The status of the current sign-up attempt as a string (for example, `'missing_requirements'`, `'complete'`, `'abandoned'`, etc.)
   */
  readonly status: SignUpStatus | null;

  /**
   * An array of strings representing unverified fields such as `’email_address’`. Can be used to detect when verification is necessary.
   */
  readonly unverifiedFields: SignUpIdentificationField[];

  /**
   * Indicates that there is a matching user for provided identifier, and that the sign-up can be transferred to
   * a sign-in.
   */
  readonly isTransferable: boolean;

  readonly existingSession?: { sessionId: string };

  create: (params: SignUpFutureCreateParams) => Promise<{ error: unknown }>;

  /**
   *
   */
  verifications: {
    /**
     * Used to send an email code to verify an email address.
     */
    sendEmailCode: () => Promise<{ error: unknown }>;

    /**
     * Used to verify a code sent via email.
     */
    verifyEmailCode: (params: SignUpFutureEmailCodeVerifyParams) => Promise<{ error: unknown }>;

    /**
     * Used to send a phone code to verify a phone number.
     */
    sendPhoneCode: (params: SignUpFuturePhoneCodeSendParams) => Promise<{ error: unknown }>;

    /**
     * Used to verify a code sent via phone.
     */
    verifyPhoneCode: (params: SignUpFuturePhoneCodeVerifyParams) => Promise<{ error: unknown }>;
  };

  /**
   * Used to sign up using an email address and password.
   */
  password: (params: SignUpFuturePasswordParams) => Promise<{ error: unknown }>;

  /**
   * Used to create an account using an OAuth connection.
   */
  sso: (params: SignUpFutureSSOParams) => Promise<{ error: unknown }>;

  /**
   * Used to convert a sign-up with `status === ‘complete’` into an active session. Will cause anything observing the
   * session state (such as the `useUser()` hook) to update automatically.
   */
  finalize: (params?: SignUpFutureFinalizeParams) => Promise<{ error: unknown }>;
}
