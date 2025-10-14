import type { SetActiveNavigate } from './clerk';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { SignUpField, SignUpIdentificationField, SignUpStatus } from './signUpCommon';
import type { Web3Strategy } from './strategies';

interface SignUpFutureAdditionalParams {
  /**
   * The user's first name. Only supported if
   * [First and last name](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#user-model)
   * is enabled in the instance settings.
   */
  firstName?: string;
  /**
   * The user's last name. Only supported if
   * [First and last name](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#user-model)
   * is enabled in the instance settings.
   */
  lastName?: string;
  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be
   * automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use
   * it to implement custom fields that can be collected during sign-up and will automatically be attached to the
   * created User object.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * A boolean indicating whether the user has agreed to the
   * [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
}

export interface SignUpFutureCreateParams extends SignUpFutureAdditionalParams {
  /**
   * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email)
   * is enabled. Keep in mind that the email address requires an extra verification process.
   */
  emailAddress?: string;
  /**
   * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if
   * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled.
   * Keep in mind that the phone number requires an extra verification process.
   */
  phoneNumber?: string;
  /**
   * The user's username. Only supported if
   * [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in
   * the instance settings.
   */
  username?: string;
  /**
   * When set to `true`, the `SignUp` will attempt to retrieve information from the active `SignIn` instance and use it
   * to complete the sign-up process. This is useful when you want to seamlessly transition a user from a sign-in
   * attempt to a sign-up attempt.
   */
  transfer?: boolean;
  /**
   * The [ticket _or token_](https://clerk.com/docs/guides/development/custom-flows/authentication/application-invitations)
   * generated from the Backend API. **Required** if `strategy` is set to `'ticket'`.
   */
  ticket?: string;
  /**
   * The Web3 wallet address, made up of 0x + 40 hexadecimal characters. **Required** if
   * [Web3 authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#web3-authentication)
   * is enabled.
   */
  web3Wallet?: string;
}

// This will likely get more properties
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SignUpFutureUpdateParams extends SignUpFutureAdditionalParams {}

export interface SignUpFutureEmailCodeVerifyParams {
  /**
   * The code that was sent to the user.
   */
  code: string;
}

export type SignUpFuturePasswordParams = SignUpFutureAdditionalParams & {
  /**
   * The user's password. Only supported if
   * [password](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#password) is enabled.
   */
  password: string;
} & (
    | {
        /**
         * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email)
         * is enabled. Keep in mind that the email address requires an extra verification process.
         */
        emailAddress: string;
        /**
         * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if
         * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled.
         * Keep in mind that the phone number requires an extra verification process.
         */
        phoneNumber?: string;
        /**
         * The user's username. Only supported if
         * [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in
         * the instance settings.
         */
        username?: string;
      }
    | {
        /**
         * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email)
         * is enabled. Keep in mind that the email address requires an extra verification process.
         */
        emailAddress?: string;
        /**
         * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if
         * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled.
         * Keep in mind that the phone number requires an extra verification process.
         */
        phoneNumber: string;
        /**
         * The user's username. Only supported if
         * [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in
         * the instance settings.
         */
        username?: string;
      }
    | {
        /**
         * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email)
         * is enabled. Keep in mind that the email address requires an extra verification process.
         */
        emailAddress?: string;
        /**
         * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if
         * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled.
         * Keep in mind that the phone number requires an extra verification process.
         */
        phoneNumber?: string;
        /**
         * The user's username. Only supported if
         * [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in
         * the instance settings.
         */
        username: string;
      }
    | {
        /**
         * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email)
         * is enabled. Keep in mind that the email address requires an extra verification process.
         */
        emailAddress?: string;
        /**
         * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if
         * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled.
         * Keep in mind that the phone number requires an extra verification process.
         */
        phoneNumber?: string;
        /**
         * The user's username. Only supported if
         * [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in
         * the instance settings.
         */
        username?: string;
      }
  );

export interface SignUpFuturePhoneCodeSendParams {
  /**
   * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if
   * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled.
   * Keep in mind that the phone number requires an extra verification process.
   */
  phoneNumber?: string;
  /**
   * The mechanism to use to send the code to the provided phone number. Defaults to `'sms'`.
   */
  channel?: PhoneCodeChannel;
}

export interface SignUpFuturePhoneCodeVerifyParams {
  /**
   * The code that was sent to the user.
   */
  code: string;
}

export interface SignUpFutureSSOParams {
  /**
   * The strategy to use for authentication.
   */
  strategy: string;
  /**
   * The URL or path to navigate to after the OAuth or SAML flow completes. Can be provided as a relative URL (such as
   * `/dashboard`), in which case it will be prefixed with the base URL of the current page.
   */
  redirectUrl: string;
  /**
   * TODO @revamp-hooks: This should be handled by FAPI instead.
   */
  redirectCallbackUrl: string;
}

export interface SignUpFutureTicketParams extends SignUpFutureAdditionalParams {
  /**
   * The [ticket _or token_](https://clerk.com/docs/guides/development/custom-flows/authentication/application-invitations)
   * generated from the Backend API. **Required** if `strategy` is set to `'ticket'`.
   */
  ticket: string;
}

export interface SignUpFutureWeb3Params extends SignUpFutureAdditionalParams {
  /**
   * The verification strategy to validate the user's sign-up request.
   */
  strategy: Web3Strategy;
}

export interface SignUpFutureFinalizeParams {
  navigate?: SetActiveNavigate;
}

/**
 * The current active `SignUp` instance, for use in custom flows.
 */
export interface SignUpFutureResource {
  /**
   * The unique identifier of the current sign-up.
   */
  readonly id?: string;

  /**
   * The status of the current sign-up.
   */
  readonly status: SignUpStatus;

  /**
   * An array of all the required fields that need to be supplied and verified in order for this sign-up to be marked
   * as complete and converted into a user.
   */
  readonly requiredFields: SignUpField[];

  /**
   * An array of all the fields that can be supplied to the sign-up, but their absence does not prevent the sign-up
   * from being marked as complete.
   */
  readonly optionalFields: SignUpField[];

  /**
   * An array of all the fields whose values are not supplied yet but they are mandatory in order for a sign-up to be
   * marked as complete.
   */
  readonly missingFields: SignUpField[];

  /**
   * An array of all the fields whose values have been supplied, but they need additional verification in order for
   * them to be accepted. Examples of such fields are `email_address` and `phone_number`.
   */
  readonly unverifiedFields: SignUpIdentificationField[];

  /**
   * Indicates that there is a matching user for provided identifier, and that the sign-up can be transferred to
   * a sign-in.
   */
  readonly isTransferable: boolean;

  readonly existingSession?: { sessionId: string };

  /**
   * The `username` supplied to the current sign-up. Only supported if
   * [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in
   * the instance settings.
   */
  readonly username: string | null;

  /**
   * The `firstName` supplied to the current sign-up. Only supported if
   * [First and last name](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#user-model)
   * is enabled in the instance settings.
   */
  readonly firstName: string | null;

  /**
   * The `lastName` supplied to the current sign-up. Only supported if
   * [First and last name](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#user-model)
   * is enabled in the instance settings.
   */
  readonly lastName: string | null;

  /**
   * The `emailAddress` supplied to the current sign-up. Only supported if
   * [email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) is enabled
   * in the instance settings.
   */
  readonly emailAddress: string | null;

  /**
   * The `phoneNumber` supplied to the current sign-up in E.164 format. Only supported if
   * [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled
   * in the instance settings.
   */
  readonly phoneNumber: string | null;

  /**
   * The Web3 wallet address supplied to the current sign-up, made up of 0x + 40 hexadecimal characters. Only supported
   * if
   * [Web3 authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#web3-authentication)
   * is enabled in the instance settings.
   */
  readonly web3Wallet: string | null;

  /**
   * The value of this attribute is true if a password was supplied to the current sign-up. Only supported if
   * [password](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#password) is enabled in
   * the instance settings.
   */
  readonly hasPassword: boolean;

  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be
   * automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use
   * it to implement custom fields that can be collected during sign-up and will automatically be attached to the
   * created User object.
   */
  readonly unsafeMetadata: SignUpUnsafeMetadata;

  /**
   * The identifier of the newly-created session. This attribute is populated only when the sign-up is complete.
   */
  readonly createdSessionId: string | null;

  /**
   * The identifier of the newly-created user. This attribute is populated only when the sign-up is complete.
   */
  readonly createdUserId: string | null;

  /**
   * The epoch numerical time when the sign-up was abandoned by the user.
   */
  readonly abandonAt: number | null;

  /**
   * The epoch numerical time when the user agreed to the
   * [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  readonly legalAcceptedAt: number | null;

  /**
   * Creates a new `SignUp` instance initialized with the provided parameters. The instance maintains the sign-up
   * lifecycle state through its `status` property, which updates as the authentication flow progresses. Will also
   * deactivate any existing sign-up process the client may already have in progress.
   *
   * What you must pass to `params` depends on which
   * [sign-up options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options) you have
   * enabled in your app's settings in the Clerk Dashboard.
   *
   * You can complete the sign-up process in one step if you supply the required fields to `create()`. Otherwise,
   * Clerk's sign-up process provides great flexibility and allows users to easily create multi-step sign-up flows.
   *
   * > [!WARNING]
   * > Once the sign-up process is complete, call the `signUp.finalize()` method to set the newly created session as
   * > the active session.
   */
  create: (params: SignUpFutureCreateParams) => Promise<{ error: unknown }>;

  /**
   * Updates the current `SignUp`.
   */
  update: (params: SignUpFutureUpdateParams) => Promise<{ error: unknown }>;

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
   * Used to perform a ticket-based sign-up.
   */
  ticket: (params?: SignUpFutureTicketParams) => Promise<{ error: unknown }>;

  /**
   * Used to perform a Web3-based sign-up.
   */
  web3: (params: SignUpFutureWeb3Params) => Promise<{ error: unknown }>;

  /**
   * Used to convert a sign-up with `status === 'complete'` into an active session. Will cause anything observing the
   * session state (such as the `useUser()` hook) to update automatically.
   */
  finalize: (params?: SignUpFutureFinalizeParams) => Promise<{ error: unknown }>;
}
