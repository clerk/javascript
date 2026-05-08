import type { ClerkError } from '../errors/clerkError';
import type { SetActiveNavigate } from './clerk';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { SignUpField, SignUpIdentificationField, SignUpStatus, SignUpVerificationResource } from './signUpCommon';
import type {
  AppleIdTokenStrategy,
  EnterpriseSSOStrategy,
  GoogleOneTapStrategy,
  OAuthStrategy,
  PhoneCodeStrategy,
  TicketStrategy,
  Web3Strategy,
} from './strategies';
import type { VerificationResource } from './verification';

/** @document */
export interface SignUpFutureAdditionalParams {
  /**
   * The user's first name. Only supported if [First and last name](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#user-model) is enabled in the instance settings.
   */
  firstName?: string;
  /**
   * The user's last name. Only supported if [First and last name](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#user-model) is enabled in the instance settings.
   */
  lastName?: string;
  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created User object.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * A boolean indicating whether the user has agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
  /**
   * The locale to assign to the user in [BCP 47](https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag) format (e.g., "en-US", "fr-FR"). If omitted, defaults to the browser's locale.
   */
  locale?: string;
}

/** @document */
export interface SignUpFutureCreateParams extends SignUpFutureAdditionalParams {
  /**
   * The strategy to use for the sign-up. The following strategies are supported:
   * <ul>
   * <li>`'oauth_<provider>'`: The user will be authenticated with their [social connection account](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/overview). See a list of [supported values for `<provider>`](https://clerk.com/docs/reference/types/sso).</li>
   * <li>`'enterprise_sso'`: The user will be authenticated either through SAML or OIDC depending on the configuration of their [enterprise SSO account](https://clerk.com/docs/guides/configure/auth-strategies/enterprise-connections/overview).</li>
   * <li>`'ticket'`: The user will be authenticated via the ticket _or token_ generated from the Backend API.</li>
   * <li>`'google_one_tap'`: The user will be authenticated with the Google One Tap UI. It's recommended to use [`authenticateWithGoogleOneTap()`](https://clerk.com/docs/reference/components/authentication/google-one-tap#authenticate-with-google-one-tap) instead, as it will also set the user's current session as active for you.</li>
   * <li>`'oauth_token_apple'`: The user will be authenticated using a native [Sign in with Apple](https://clerk.com/docs/guides/configure/auth-strategies/sign-in-with-apple) identity token.</li>
   * <li>`'phone_code'`: The user will receive a one-time code via SMS to verify their phone number.</li>
   * </ul>
   */
  strategy?:
    | OAuthStrategy
    | EnterpriseSSOStrategy
    | TicketStrategy
    | GoogleOneTapStrategy
    | AppleIdTokenStrategy
    | PhoneCodeStrategy;
  /**
   * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) is enabled. Keep in mind that the email address requires an extra verification process.
   */
  emailAddress?: string;
  /**
   * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled. Keep in mind that the phone number requires an extra verification process.
   */
  phoneNumber?: string;
  /**
   * The user's username. Only supported if [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in the instance settings.
   */
  username?: string;
  /**
   * The user's password. Only supported if [password](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#password) is enabled.
   */
  password?: string;
  /**
   * When set to `true`, the `SignUp` will attempt to retrieve information from the active `SignIn` instance and use it to complete the sign-up process. This is useful when you want to seamlessly transition a user from a sign-in attempt to a sign-up attempt.
   */
  transfer?: boolean;
  /**
   * **Required** if `strategy` is set to `'ticket'`. The [ticket _or token_](https://clerk.com/docs/guides/development/custom-flows/authentication/application-invitations) generated from the Backend API.
   */
  ticket?: string;
  /**
   * The Web3 wallet address, made up of 0x + 40 hexadecimal characters. Only supported if [Web3 authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#web3-authentication) is enabled.
   */
  web3Wallet?: string;
}

/** @document */
export interface SignUpFutureUpdateParams extends SignUpFutureAdditionalParams {
  /**
   * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) is enabled. Keep in mind that the email address requires an extra verification process.
   */
  emailAddress?: string;
  /**
   * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled. Keep in mind that the phone number requires an extra verification process.
   */
  phoneNumber?: string;
  /**
   * The user's username. Only supported if [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in the instance settings.
   */
  username?: string;
}

/** @document */
export interface SignUpFutureEmailCodeVerifyParams {
  /**
   * The code that was sent to the user.
   */
  code: string;
}

/** @document */
export interface SignUpFutureEmailLinkSendParams {
  /**
   * The full URL that the user will be redirected to when they visit the email link.
   */
  verificationUrl: string;
}

/** @document */
export type SignUpFuturePasswordParams = SignUpFutureAdditionalParams & {
  /**
   * The user's password. Only supported if [password](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#password) is enabled.
   */
  password: string;
} & (
    | {
        /**
         * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) is enabled. Keep in mind that the email address requires an extra verification process.
         */
        emailAddress: string;
        /**
         * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled. Keep in mind that the phone number requires an extra verification process.
         */
        phoneNumber?: string;
        /**
         * The user's username. Only supported if [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in the instance settings.
         */
        username?: string;
      }
    | {
        /**
         * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) is enabled. Keep in mind that the email address requires an extra verification process.
         */
        emailAddress?: string;
        /**
         * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled. Keep in mind that the phone number requires an extra verification process.
         */
        phoneNumber: string;
        /**
         * The user's username. Only supported if [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in the instance settings.
         */
        username?: string;
      }
    | {
        /**
         * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) is enabled. Keep in mind that the email address requires an extra verification process.
         */
        emailAddress?: string;
        /**
         * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled. Keep in mind that the phone number requires an extra verification process.
         */
        phoneNumber?: string;
        /**
         * The user's username. Only supported if [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in the instance settings.
         */
        username: string;
      }
    | {
        /**
         * The user's email address. Only supported if [Email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) is enabled. Keep in mind that the email address requires an extra verification process.
         */
        emailAddress?: string;
        /**
         * The user's phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164). Only supported if [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled. Keep in mind that the phone number requires an extra verification process.
         */
        phoneNumber?: string;
        /**
         * The user's username. Only supported if [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in the instance settings.
         */
        username?: string;
      }
  );

/** @document */
export interface SignUpFuturePhoneCodeSendParams {
  /**
   * The mechanism to use to send the code to the provided phone number. Defaults to `'sms'`.
   */
  channel?: PhoneCodeChannel;
}

/** @document */
export interface SignUpFuturePhoneCodeVerifyParams {
  /**
   * The code that was sent to the user.
   */
  code: string;
}

/** @document */
export interface SignUpFutureSSOParams extends SignUpFutureAdditionalParams {
  /**
   * The strategy to use for authentication.
   */
  strategy: string;
  /**
   * The URL or path to navigate to after the OAuth or SAML flow completes. Can be provided as a relative URL (such as `/dashboard`), in which case it will be prefixed with the base URL of the current page.
   */
  redirectUrl: string;
  /**
   * The URL or path to navigate to if a session was not created, and needs additional information.
   * TODO @revamp-hooks: This should be handled by FAPI instead.
   */
  redirectCallbackUrl: string;
  /**
   * If provided, a `Window` to use for the OAuth flow. Useful in instances where you cannot navigate to an OAuth provider.
   *
   * @example
   * ```ts
   * const popup = window.open('about:blank', '', 'width=600,height=800');
   * if (!popup) {
   *   throw new Error('Failed to open popup');
   * }
   * await signIn.sso({ popup, strategy: 'oauth_google', redirectUrl: '/dashboard' });
   * ```
   */
  popup?: Window;
  /**
   * The value to pass to the [OIDC prompt parameter](https://openid.net/specs/openid-connect-core-1_0.html#:~:text=prompt,reauthentication%20and%20consent.) in the generated OAuth redirect URL.
   */
  oidcPrompt?: string;
  /**
   * The identifier of the enterprise connection to target when using the `enterprise_sso` strategy.
   * @experimental
   */
  enterpriseConnectionId?: string;
  /**
   * The email address to use for targeting an enterprise connection at sign-up.
   */
  emailAddress?: string;
}

/** @document */
export interface SignUpFutureTicketParams extends SignUpFutureAdditionalParams {
  /**
   * **Required** if `strategy` is set to `'ticket'`. The [ticket _or token_](https://clerk.com/docs/guides/development/custom-flows/authentication/application-invitations) generated from the Backend API.
   */
  ticket: string;
}

/** @document */
export interface SignUpFutureWeb3Params extends SignUpFutureAdditionalParams {
  /**
   * The verification strategy to validate the user's sign-up request.
   */
  strategy: Web3Strategy;
}

/** @document */
export interface SignUpFutureFinalizeParams {
  /**
   * A custom navigation function to be called just before the session and/or Organization is set. When provided, it takes precedence over the `redirectUrl` parameter for navigation. The callback receives a `decorateUrl` function that should be used to wrap destination URLs. This enables Safari ITP cookie refresh when needed. The decorated URL may be an external URL (starting with `https://`) that requires `window.location.href` instead of client-side navigation. See the [section on using the `navigate()` parameter](https://clerk.com/docs/reference/objects/clerk#using-the-navigate-parameter) for more details.
   */
  navigate?: SetActiveNavigate;
}

/**
 * Contains information about the available verification strategies for a sign-up attempt.
 */
export interface SignUpFutureVerifications {
  /**
   * Holds information about the email address verification.
   */
  readonly emailAddress: SignUpVerificationResource;

  /**
   * Holds information about the phone number verification.
   */
  readonly phoneNumber: SignUpVerificationResource;

  /**
   * Holds information about the Web3 wallet verification.
   */
  readonly web3Wallet: VerificationResource;

  /**
   * Holds information about the external account verification.
   */
  readonly externalAccount: VerificationResource;

  /**
   * The verification status for email link flows.
   */
  readonly emailLinkVerification: {
    /**
     * The verification status.
     */
    status: 'verified' | 'expired' | 'failed' | 'client_mismatch';

    /**
     * The created session ID.
     */
    createdSessionId: string;

    /**
     * Whether the verification was from the same client.
     */
    verifiedFromTheSameClient: boolean;
  } | null;

  /**
   * Sends an email code to verify an email address.
   */
  sendEmailCode: () => Promise<{ error: ClerkError | null }>;

  /**
   * Verifies a code sent via [`verifications.sendEmailCode()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-email-code).
   */
  verifyEmailCode: (params: SignUpFutureEmailCodeVerifyParams) => Promise<{ error: ClerkError | null }>;

  /**
   * Sends an email link to verify an email address.
   */
  sendEmailLink: (params: SignUpFutureEmailLinkSendParams) => Promise<{ error: ClerkError | null }>;

  /**
   * Will wait for email link verification to complete or expire after calling [`verifications.sendEmailLink()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-email-link).
   */
  waitForEmailLinkVerification: () => Promise<{ error: ClerkError | null }>;

  /**
   * Sends a phone code to verify a phone number.
   */
  sendPhoneCode: (params?: SignUpFuturePhoneCodeSendParams) => Promise<{ error: ClerkError | null }>;

  /**
   * Verifies a code sent via [`verifications.sendPhoneCode()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-phone-code).
   */
  verifyPhoneCode: (params: SignUpFuturePhoneCodeVerifyParams) => Promise<{ error: ClerkError | null }>;
}

/**
 * The `SignUpFuture` class holds the state of the current sign-up attempt and provides methods to drive custom sign-up flows, including email/phone verification, password, SSO, ticket-based, and Web3-based account creation.
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
   * An array of all the required fields that need to be supplied and verified in order for this sign-up to be marked as complete and converted into a user.
   */
  readonly requiredFields: SignUpField[];

  /**
   * An array of all the fields that can be supplied to the sign-up, but their absence does not prevent the sign-up from being marked as complete.
   */
  readonly optionalFields: SignUpField[];

  /**
   * An array of all the fields whose values are not supplied yet but they are mandatory in order for a sign-up to be marked as complete.
   */
  readonly missingFields: SignUpField[];

  /**
   * An array of all the fields whose values have been supplied, but they need additional verification in order for them to be accepted. Examples of such fields are `email_address` and `phone_number`.
   */
  readonly unverifiedFields: SignUpIdentificationField[];

  /**
   * Indicates that there is a matching user for provided identifier, and that the sign-up can be transferred to a sign-in.
   */
  readonly isTransferable: boolean;

  /**
   * Indicates that the sign-up was not able to create a new session because the identifier already exists in an existing session.
   */
  readonly existingSession?: {
    /**
     * The ID of the existing session.
     */
    sessionId: string;
  };

  /**
   * The `username` supplied to the current sign-up. Only supported if [username](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#username) is enabled in the instance settings.
   */
  readonly username: string | null;

  /**
   * The `firstName` supplied to the current sign-up. Only supported if [First and last name](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#user-model) is enabled in the instance settings.
   */
  readonly firstName: string | null;

  /**
   * The `lastName` supplied to the current sign-up. Only supported if [First and last name](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#user-model) is enabled in the instance settings.
   */
  readonly lastName: string | null;

  /**
   * The `emailAddress` supplied to the current sign-up. Only supported if [email address](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) is enabled in the instance settings.
   */
  readonly emailAddress: string | null;

  /**
   * The `phoneNumber` supplied to the current sign-up in E.164 format. Only supported if [phone number](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) is enabled in the instance settings.
   */
  readonly phoneNumber: string | null;

  /**
   * The Web3 wallet address supplied to the current sign-up, made up of 0x + 40 hexadecimal characters. Only supported if [Web3 authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#web3-authentication) is enabled in the instance settings.
   */
  readonly web3Wallet: string | null;

  /**
   * The value of this attribute is true if a password was supplied to the current sign-up. Only supported if [password](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#password) is enabled in the instance settings.
   */
  readonly hasPassword: boolean;

  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created User object.
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
   * The epoch numerical time when the user agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  readonly legalAcceptedAt: number | null;

  /**
   * The locale of the user in BCP 47 format.
   */
  readonly locale: string | null;

  /**
   * Indicates that the sign-up can be discarded (has been finalized or explicitly reset).
   *
   * @internal
   */
  readonly canBeDiscarded: boolean;

  /**
   * Creates a new `SignUp` instance initialized with the provided parameters. The instance maintains the sign-up lifecycle state through its `status` property, which updates as the authentication flow progresses. Will also deactivate any existing sign-up process the client may already have in progress. Once the sign-up process is complete, call the [`signUp.finalize()`](https://clerk.com/docs/reference/objects/sign-up-future#finalize) method to set the newly created session as the active session.
   *
   * What you must pass to `params` depends on which [sign-up options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options) you have enabled in your app's settings in the Clerk Dashboard.
   *
   * You can complete the sign-up process in one step if you supply the required fields to `create()`. Otherwise, Clerk's sign-up process provides great flexibility and allows users to easily create multi-step sign-up flows.
   *
   * > [!IMPORTANT]
   * > The `signUp.create()` method is intended for advanced use cases. For most use cases, prefer the use of the factor-specific methods such as `signUp.password()`, `signUp.sso()`, etc.
   */
  create: (params: SignUpFutureCreateParams) => Promise<{ error: ClerkError | null }>;

  /**
   * Updates the current `SignUp`.
   */
  update: (params: SignUpFutureUpdateParams) => Promise<{ error: ClerkError | null }>;

  /**
   * An object that contains information about all available verification strategies.
   * @extractMethods
   */
  verifications: SignUpFutureVerifications;

  /**
   * Performs a password-based sign-up.
   */
  password: (params: SignUpFuturePasswordParams) => Promise<{ error: ClerkError | null }>;

  /**
   * Performs an OAuth-based sign-up.
   */
  sso: (params: SignUpFutureSSOParams) => Promise<{ error: ClerkError | null }>;

  /**
   * Performs a ticket-based sign-up.
   */
  ticket: (params?: SignUpFutureTicketParams) => Promise<{ error: ClerkError | null }>;

  /**
   * Performs a Web3-based sign-up.
   */
  web3: (params: SignUpFutureWeb3Params) => Promise<{ error: ClerkError | null }>;

  /**
   * Converts a sign-up with `status === 'complete'` into an active session. Will cause anything observing the session state (such as the `useUser()` hook) to update automatically.
   */
  finalize: (params?: SignUpFutureFinalizeParams) => Promise<{ error: ClerkError | null }>;

  /**
   * Resets the current sign-up attempt by clearing all local state back to null. This is useful when you want to allow users to go back to the beginning of the sign-up flow (e.g., to change their email address during verification).
   *
   * Unlike other methods, `reset()` does not trigger the `fetchStatus` to change to `'fetching'` and does not make any API calls - it only clears local state.
   */
  reset: () => Promise<{ error: ClerkError | null }>;
}
