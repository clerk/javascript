import type { SetActiveNavigate } from './clerk';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { SignInFirstFactor, SignInSecondFactor, SignInStatus, UserData } from './signInCommon';
import type { OAuthStrategy, Web3Strategy } from './strategies';
import type { VerificationResource } from './verification';

export interface SignInFutureCreateParams {
  /**
   * The authentication identifier for the sign-in. This can be the value of the user's email address, phone number,
   * username, or Web3 wallet address.
   */
  identifier?: string;
  /**
   * The first factor verification strategy to use in the sign-in flow. Depends on the `identifier` value. Each
   * authentication identifier supports different verification strategies.
   */
  strategy?: OAuthStrategy | 'saml' | 'enterprise_sso';
  /**
   * The full URL or path that the OAuth provider should redirect to after successful authorization on their part.
   */
  redirectUrl?: string;
  /**
   * The URL that the user will be redirected to, after successful authorization from the OAuth provider and
   * Clerk sign-in.
   */
  actionCompleteRedirectUrl?: string;
  /**
   * When set to `true`, the `SignIn` will attempt to retrieve information from the active `SignUp` instance and use it
   * to complete the sign-in process. This is useful when you want to seamlessly transition a user from a sign-up
   * attempt to a sign-in attempt.
   */
  transfer?: boolean;
  /**
   * The [ticket _or token_](https://clerk.com/docs/guides/development/custom-flows/authentication/application-invitations)
   * generated from the Backend API. **Required** if `strategy` is set to `'ticket'`.
   */
  ticket?: string;
}

export type SignInFuturePasswordParams = {
  /**
   * The user's password. Only supported if
   * [password](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#password) is enabled.
   */
  password: string;
} & (
  | {
      /**
       * The authentication identifier for the sign-in. This can be the value of the user's email address, phone number,
       * username, or Web3 wallet address.
       */
      identifier: string;
      emailAddress?: never;
      phoneNumber?: never;
    }
  | {
      /**
       * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email)
       * is enabled.
       */
      emailAddress: string;
      identifier?: never;
      phoneNumber?: never;
    }
  | {
      /**
       * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if
       * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled.
       */
      phoneNumber: string;
      identifier?: never;
      emailAddress?: never;
    }
  | {
      phoneNumber?: never;
      identifier?: never;
      emailAddress?: never;
    }
);

export type SignInFutureEmailCodeSendParams =
  | {
      /**
       * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email)
       * is enabled.
       */
      emailAddress?: string;
      emailAddressId?: never;
    }
  | {
      /**
       * The ID for the user's email address that will receive an email with the one-time authentication code.
       */
      emailAddressId?: string;
      emailAddress?: never;
    };

export type SignInFutureEmailLinkSendParams = {
  /**
   * The full URL that the user will be redirected to when they visit the email link.
   */
  verificationUrl: string;
} & (
  | {
      /**
       * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email)
       * is enabled.
       */
      emailAddress?: string;
      emailAddressId?: never;
    }
  | {
      /**
       * The ID for the user's email address that will receive an email with the email link.
       */
      emailAddressId?: string;
      emailAddress?: never;
    }
);

export interface SignInFutureEmailCodeVerifyParams {
  /**
   * The one-time code that was sent to the user.
   */
  code: string;
}

export interface SignInFutureResetPasswordSubmitParams {
  /**
   * The new password for the user.
   */
  password: string;
  /**
   * If `true`, signs the user out of all other authenticated sessions.
   */
  signOutOfOtherSessions?: boolean;
}

export type SignInFuturePhoneCodeSendParams = {
  /**
   * The mechanism to use to send the code to the provided phone number. Defaults to `'sms'`.
   */
  channel?: PhoneCodeChannel;
} & (
  | {
      /**
       * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if
       * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled.
       */
      phoneNumber?: string;
      phoneNumberId?: never;
    }
  | {
      /**
       * The ID for the user's phone number that will receive a message with the one-time authentication code.
       */
      phoneNumberId: string;
      phoneNumber?: never;
    }
);

export interface SignInFuturePhoneCodeVerifyParams {
  /**
   * The one-time code that was sent to the user.
   */
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
  /**
   * The one-time code that was sent to the user as part of the `signIn.mfa.sendPhoneCode()` method.
   */
  code: string;
}

export interface SignInFutureTOTPVerifyParams {
  /**
   * The TOTP generated by the user's authenticator app.
   */
  code: string;
}

export interface SignInFutureBackupCodeVerifyParams {
  /**
   * The backup code that was provided to the user when they set up two-step authentication.
   */
  code: string;
}

export interface SignInFutureTicketParams {
  /**
   * The [ticket _or token_](https://clerk.com/docs/guides/development/custom-flows/authentication/application-invitations)
   * generated from the Backend API.
   */
  ticket: string;
}

export interface SignInFutureWeb3Params {
  /**
   * The verification strategy to validate the user's sign-in request.
   */
  strategy: Web3Strategy;
}

export interface SignInFutureFinalizeParams {
  navigate?: SetActiveNavigate;
}

/**
 * The current active `SignIn` instance, for use in custom flows.
 */
export interface SignInFutureResource {
  /**
   * The unique identifier for the current sign-in attempt.
   */
  readonly id?: string;

  /**
   * Array of the first factors that are supported in the current sign-in. Each factor contains information about the
   * verification strategy that can be used.
   */
  readonly supportedFirstFactors: SignInFirstFactor[];

  /**
   * Array of the second factors that are supported in the current sign-in. Each factor contains information about the
   * verification strategy that can be used. his property is populated only when the first factor is verified.
   */
  readonly supportedSecondFactors: SignInSecondFactor[];

  /**
   * The current status of the sign-in.
   */
  readonly status: SignInStatus;

  /**
   * Indicates that there is not a matching user for the first-factor verification used, and that the sign-in can be
   * transferred to a sign-up.
   */
  readonly isTransferable: boolean;

  readonly existingSession?: { sessionId: string };

  /**
   * The state of the verification process for the selected first factor. Initially, this property contains an empty
   * verification object, since there is no first factor selected.
   */
  readonly firstFactorVerification: VerificationResource;

  /**
   * The state of the verification process for the selected second factor. Initially, this property contains an empty
   * verification object, since there is no second factor selected.
   */
  readonly secondFactorVerification: VerificationResource;

  /**
   * The authentication identifier value for the current sign-in. `null` if the `strategy` is `'oauth_<provider>'`
   * or `'enterprise_sso'`.
   */
  readonly identifier: string | null;

  /**
   * The identifier of the session that was created upon completion of the current sign-in. The value of this property
   * is `null` if the sign-in status is not `'complete'`.
   */
  readonly createdSessionId: string | null;

  /**
   * An object containing information about the user of the current sign-in. This property is populated only once an
   * identifier is given to the `SignIn` object through `signIn.create()` or another method that populates the
   * `identifier` property.
   */
  readonly userData: UserData;

  /**
   * Creates a new `SignIn` instance initialized with the provided parameters. The instance maintains the sign-in
   * lifecycle state through its `status` property, which updates as the authentication flow progresses.
   *
   * What you must pass to `params` depends on which {@link https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options | sign-in options}
   * you have enabled in your app's settings in the Clerk Dashboard.
   *
   * You can complete the sign-in process in one step if you supply the required fields to `create()`. Otherwise,
   * Clerk's sign-in process provides great flexibility and allows users to easily create multi-step sign-in flows.
   *
   * > [!WARNING]
   * > Once the sign-in process is complete, call the `signIn.finalize()` method to set the newly created session as
   * > the active session.
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
  emailLink: {
    /**
     * Used to send an email link to sign-in
     */
    sendLink: (params: SignInFutureEmailLinkSendParams) => Promise<{ error: unknown }>;

    /**
     * Will wait for verification to complete or expire
     */
    waitForVerification: () => Promise<{ error: unknown }>;

    /**
     * The verification status
     */
    verification: {
      /**
       * The verification status
       */
      status: 'verified' | 'expired' | 'failed' | 'client_mismatch';

      /**
       * The created session ID
       */
      createdSessionId: string;

      /**
       * Whether the verification was from the same client
       */
      verifiedFromTheSameClient: boolean;
    } | null;
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
   * Used to perform a ticket-based sign-in.
   */
  ticket: (params?: SignInFutureTicketParams) => Promise<{ error: unknown }>;

  /**
   * Used to perform a Web3-based sign-in.
   */
  web3: (params: SignInFutureWeb3Params) => Promise<{ error: unknown }>;

  /**
   * Used to convert a sign-in with `status === 'complete'` into an active session. Will cause anything observing the
   * session state (such as the `useUser()` hook) to update automatically.
   */
  finalize: (params?: SignInFutureFinalizeParams) => Promise<{ error: unknown }>;
}
