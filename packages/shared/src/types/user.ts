import type { BackupCodeResource } from './backupCode';
import type { BillingPayerMethods } from './billing';
import type { DeletedObjectResource } from './deletedObject';
import type { EmailAddressResource } from './emailAddress';
import type { EnterpriseAccountResource } from './enterpriseAccount';
import type {
  CreateOrganizationEnterpriseConnectionParams,
  EnterpriseConnectionResource,
  UpdateOrganizationEnterpriseConnectionParams,
} from './enterpriseConnection';
import type {
  EnterpriseConnectionTestRunInitResource,
  EnterpriseConnectionTestRunResource,
  GetEnterpriseConnectionTestRunsParams,
} from './enterpriseConnectionTestRun';
import type { ExternalAccountResource } from './externalAccount';
import type { ImageResource } from './image';
import type { UserJSON } from './json';
import type { OAuthScope } from './oauth';
import type { OrganizationCreationDefaultsResource } from './organizationCreationDefaults';
import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { OrganizationMembershipResource } from './organizationMembership';
import type { OrganizationSuggestionResource, OrganizationSuggestionStatus } from './organizationSuggestion';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { PasskeyResource } from './passkey';
import type { PhoneNumberResource } from './phoneNumber';
import type { ClerkResource } from './resource';
import type { SessionWithActivitiesResource } from './session';
import type { UserJSONSnapshot } from './snapshots';
import type { OAuthStrategy } from './strategies';
import type { TOTPResource } from './totp';
import type { UserOrganizationInvitationResource } from './userOrganizationInvitation';
import type { SnakeToCamel } from './utils';
import type { Web3WalletResource } from './web3Wallet';

declare global {
  /**
   * If you want to provide custom types for the user.publicMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every user object will use the provided type.
   */
  interface UserPublicMetadata {
    [k: string]: unknown;
  }

  /**
   * If you want to provide custom types for the user.privateMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every user object will use the provided type.
   */
  interface UserPrivateMetadata {
    [k: string]: unknown;
  }

  /**
   * If you want to provide custom types for the user.unsafeMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every user object will use the provided type.
   */
  interface UserUnsafeMetadata {
    [k: string]: unknown;
  }
}

/**
 * The `User` object holds all of the information for a single user of your application and provides a set of methods to manage their account. Each `User` has at least one authentication identifier, which might be their email address, phone number, or a username.
 *
 * A user can be contacted at their primary email address or primary phone number. They can have more than one registered email address or phone number, but only one of them will be their primary email address (`User.primaryEmailAddress`) or primary phone number (`User.primaryPhoneNumber`). At the same time, a user can also have one or more external accounts by connecting to [social providers](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/overview) such as Google, Apple, Facebook, and many more (`User.externalAccounts`).
 *
 * Finally, a `User` object holds profile data like the user's name, profile picture, and a set of [metadata](https://clerk.com/docs/guides/users/extending) that can be used internally to store arbitrary information. The metadata are split into `publicMetadata` and `privateMetadata`. Both types are set from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}, but public metadata can also be accessed from the [Frontend API](https://clerk.com/docs/reference/frontend-api){{ target: '_blank' }}.

 */
export interface UserResource extends ClerkResource, BillingPayerMethods {
  /**
   * The unique identifier of the user.
   */
  id: string;
  /**
   * The user's ID as used in your external systems. Must be unique across your instance.
   */
  externalId: string | null;
  /**
   * The ID of the user's primary email address.
   */
  primaryEmailAddressId: string | null;
  /**
   * The user's primary email address.
   */
  primaryEmailAddress: EmailAddressResource | null;
  /**
   * The ID of the user's primary phone number.
   */
  primaryPhoneNumberId: string | null;
  /**
   * The user's primary phone number.
   */
  primaryPhoneNumber: PhoneNumberResource | null;
  /**
   * The ID of the user's primary Web3 wallet.
   */
  primaryWeb3WalletId: string | null;
  /**
   * The user's primary Web3 wallet.
   */
  primaryWeb3Wallet: Web3WalletResource | null;
  /**
   * The user's username.
   */
  username: string | null;
  /**
   * The user's full name.
   */
  fullName: string | null;
  /**
   * The user's first name.
   */
  firstName: string | null;
  /**
   * The user's last name.
   */
  lastName: string | null;
  /**
   * Holds the default avatar or user's uploaded profile image. Compatible with Clerk's [Image Optimization](https://clerk.com/docs/guides/development/image-optimization).
   */
  imageUrl: string;
  /**
   * Indicates whether the user has uploaded an image or one was copied from OAuth. Returns `false` if Clerk is displaying an avatar for the user.
   */
  hasImage: boolean;
  /**
   * An array of all the `EmailAddress` objects associated with the user. Includes the primary.
   */
  emailAddresses: EmailAddressResource[];
  /**
   * An array of all the `PhoneNumber` objects associated with the user. Includes the primary.
   */
  phoneNumbers: PhoneNumberResource[];
  /**
   * An array of all the `Web3Wallet` objects associated with the user. Includes the primary.
   */
  web3Wallets: Web3WalletResource[];
  /**
   * An array of all the `ExternalAccount` objects associated with the user via OAuth.
   */
  externalAccounts: ExternalAccountResource[];
  /**
   * An array of all the `EnterpriseAccount` objects associated with the user via enterprise SSO.
   */
  enterpriseAccounts: EnterpriseAccountResource[];
  /**
   * An array of all the `Passkey` objects associated with the user.
   */
  passkeys: PasskeyResource[];
  /**
   * An array of all the `OrganizationMembership` objects associated with the user.
   */
  organizationMemberships: OrganizationMembershipResource[];
  /**
   * Indicates whether the user has a password on their account.
   */
  passwordEnabled: boolean;
  /**
   * Indicates whether the user has enabled TOTP.
   */
  totpEnabled: boolean;
  /**
   * Indicates whether the user has enabled backup codes.
   */
  backupCodeEnabled: boolean;
  /**
   * Indicates whether the user has enabled two-factor authentication.
   */
  twoFactorEnabled: boolean;
  /**
   * Metadata that can be read from the Frontend API and Backend API and can be set only from the Backend API.
   */
  publicMetadata: UserPublicMetadata;
  /**
   * Metadata that can be read and set from the Frontend API. It's considered unsafe because it can be modified from the frontend.
   *
   * There is also an `unsafeMetadata` attribute in the [`SignUp`](https://clerk.com/docs/reference/objects/sign-up-future) object. The value of that field will be automatically copied to the user's unsafe metadata once the sign-up is complete.
   */
  unsafeMetadata: UserUnsafeMetadata;
  /**
   * The date and time when the user last signed in.
   */
  lastSignInAt: Date | null;
  /**
   * The date and time when the user accepted the legal compliance documents. `null` if [**Require express consent to legal documents**](https://clerk.com/docs/guides/secure/legal-compliance) is not enabled.
   */
  legalAcceptedAt: Date | null;
  /**
   * Indicates whether the user can create organizations.
   */
  createOrganizationEnabled: boolean;
  /**
   * The maximum number of organizations the user can create.
   */
  createOrganizationsLimit: number | null;
  /**
   * Indicates whether the user can delete their own account.
   */
  deleteSelfEnabled: boolean;
  /**
   * The date and time when the user was last updated.
   */
  updatedAt: Date | null;
  /**
   * The date and time when the user was created.
   */
  createdAt: Date | null;

  /**
   * Updates the user's attributes. Use this method to save information you collected about the user.
   *
   * The appropriate settings must be enabled in the Clerk Dashboard for the user to be able to update their attributes. For example, if you want to use the `update({ firstName })` method, you must enable the **First and last name** setting. It can be found on the [**User & authentication**](https://dashboard.clerk.com/~/user-authentication/user-and-authentication?user_auth_tab=user-profile) page in the Clerk Dashboard.
   * @skipParametersSection
   */
  update: (params: UpdateUserParams) => Promise<UserResource>;
  /**
   * Updates the user's `unsafeMetadata` using deep-merge semantics. Unlike [`update()`](https://clerk.com/docs/reference/objects/user#update), which fully replaces `unsafeMetadata`, this method merges the provided value with the existing `unsafeMetadata`. Top-level and nested keys are merged, and any key set to `null` is removed. Only `unsafeMetadata` is writable from the frontend; `publicMetadata` and `privateMetadata` can only be set from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}.
   */
  updateMetadata: (params: UpdateUserMetadataParams) => Promise<UserResource>;
  /**
   * Deletes the current user.
   */
  delete: () => Promise<void>;
  /**
   * Updates the user's password.
   */
  updatePassword: (params: UpdateUserPasswordParams) => Promise<UserResource>;
  /**
   * Removes the user's password.
   */
  removePassword: (params: RemoveUserPasswordParams) => Promise<UserResource>;
  /**
   * Adds an email address for the user. A new [`EmailAddress`](https://clerk.com/docs/reference/types/email-address) will be created and associated with the user.
   *
   * > [!WARNING]
   * > [**Email** must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) in your app's settings in the Clerk Dashboard.
   */
  createEmailAddress: (params: CreateEmailAddressParams) => Promise<EmailAddressResource>;
  /**
   * Creates a passkey for the signed-in user. For an example, see the [custom flow guide](https://clerk.com/docs/guides/development/custom-flows/authentication/passkeys#create-user-passkeys).
   * @returns A [`PasskeyResource`](https://clerk.com/docs/reference/types/passkey-resource) object.
   *
   * > [!NOTE]
   * > When creating a passkey for a user in a multi-domain Clerk app, `createPasskey()` must be called from the primary domain.
   */
  createPasskey: () => Promise<PasskeyResource>;
  /**
   * Adds a phone number for the user. A new [`PhoneNumber`](https://clerk.com/docs/reference/types/phone-number) will be created and associated with the user.
   *
   * > [!WARNING]
   * > [**Phone** must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) in your app's settings in the Clerk Dashboard.
   */
  createPhoneNumber: (params: CreatePhoneNumberParams) => Promise<PhoneNumberResource>;
  /**
   * Adds a Web3 wallet for the user. A new [`Web3WalletResource`](https://clerk.com/docs/reference/types/web3-wallet) will be created and associated with the user.
   */
  createWeb3Wallet: (params: CreateWeb3WalletParams) => Promise<Web3WalletResource>;
  /**
   * A check whether or not the given resource is the primary identifier for the user.
   * @param ident - The resource checked against the user to see if it is the primary identifier.
   */
  isPrimaryIdentification: (ident: EmailAddressResource | PhoneNumberResource | Web3WalletResource) => boolean;
  /**
   * Gets all **active** sessions for this user. This method uses a cache so a network request will only be triggered only once.
   * @returns An array of [`SessionWithActivities`](https://clerk.com/docs/reference/types/session-with-activities) objects.
   */
  getSessions: () => Promise<SessionWithActivitiesResource[]>;
  /**
   * Adds the user's profile image or replaces it if one already exists. This method will upload an image and associate it with the user.
   */
  setProfileImage: (params: SetProfileImageParams) => Promise<ImageResource>;
  /**
   * Adds an external account for the user. A new [`ExternalAccount`](https://clerk.com/docs/reference/types/external-account) will be created and associated with the user. This method is useful if you want to allow an already signed-in user to connect their account with an external provider, such as Facebook, GitHub, etc., so that they can sign in with that provider in the future.
   *
   * > [!WARNING]
   * > The social provider that you want to connect to [must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#sso-connections) in your app's settings in the Clerk Dashboard.
   */
  createExternalAccount: (params: CreateExternalAccountParams) => Promise<ExternalAccountResource>;
  getOrganizationMemberships: GetOrganizationMemberships;
  /**
   * Gets a list of Organization invitations for the user.
   * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`UserOrganizationInvitation`](https://clerk.com/docs/reference/types/user-organization-invitation) objects.
   */
  getOrganizationInvitations: (
    params?: GetUserOrganizationInvitationsParams,
  ) => Promise<ClerkPaginatedResponse<UserOrganizationInvitationResource>>;
  /**
   * Gets a list of Organization suggestions for the user.
   * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`OrganizationSuggestionResource`](https://clerk.com/docs/reference/types/organization-suggestion) objects.
   */
  getOrganizationSuggestions: (
    params?: GetUserOrganizationSuggestionsParams,
  ) => Promise<ClerkPaginatedResponse<OrganizationSuggestionResource>>;
  /**
   * Gets organization creation defaults for the current user.
   * @returns A [`OrganizationCreationDefaultsResource`](https://clerk.com/docs/reference/types/organization-creation-defaults) object.
   */
  getOrganizationCreationDefaults: () => Promise<OrganizationCreationDefaultsResource>;
  /**
   * Leaves an organization that the user is a member of.
   * @param organizationId - The ID of the organization to leave.
   * @returns A [`DeletedObjectResource`](https://clerk.com/docs/reference/types/deleted-object-resource) object.
   */
  leaveOrganization: (organizationId: string) => Promise<DeletedObjectResource>;
  getEnterpriseConnections: (params?: GetEnterpriseConnectionsParams) => Promise<EnterpriseConnectionResource[]>;
  createEnterpriseConnection: (
    params: CreateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource>;
  updateEnterpriseConnection: (
    enterpriseConnectionId: string,
    params: UpdateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource>;
  deleteEnterpriseConnection: (enterpriseConnectionId: string) => Promise<DeletedObjectResource>;
  createEnterpriseConnectionTestRun: (
    enterpriseConnectionId: string,
  ) => Promise<EnterpriseConnectionTestRunInitResource>;
  getEnterpriseConnectionTestRuns: (
    enterpriseConnectionId: string,
    params?: GetEnterpriseConnectionTestRunsParams,
  ) => Promise<ClerkPaginatedResponse<EnterpriseConnectionTestRunResource>>;
  /**
   * Generates a TOTP secret for a user that can be used to register the application on the user's authenticator app of choice. If this method is called again (while still unverified), it replaces the previously generated secret.
   * @returns A [`TOTPResource`](https://clerk.com/docs/reference/types/totp-resource) object.
   *
   * > [!WARNING]
   * > The **Authenticator application** multi-factor strategy must be enabled in your app's settings in the Clerk Dashboard. See the [Multi-factor authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication) section to learn more.
   */
  createTOTP: () => Promise<TOTPResource>;
  /**
   * Verifies a TOTP secret after a user has created it. The user must provide a code from their authenticator app that has been generated using the previously created secret. This way, correct set up and ownership of the authenticator app can be validated.
   * @returns A [`TOTPResource`](https://clerk.com/docs/reference/types/totp-resource) object.
   *
   * > [!WARNING]
   * > The **Authenticator application** multi-factor strategy must be enabled in your app's settings in the Clerk Dashboard. See the [Multi-factor authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication) section to learn more.
   */
  verifyTOTP: (params: VerifyTOTPParams) => Promise<TOTPResource>;
  /**
   * Disables TOTP by deleting the user's TOTP secret.
   * @returns A [`DeletedObjectResource`](https://clerk.com/docs/reference/types/deleted-object-resource) object.
   *
   * > [!WARNING]
   * > The **Authenticator application** multi-factor strategy must be enabled in your app's settings in the Clerk Dashboard. See the [Multi-factor authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication) section to learn more.
   */
  disableTOTP: () => Promise<DeletedObjectResource>;
  /**
   * Generates a fresh new set of backup codes for the user. Every time the method is called, it will replace the previously generated backup codes.
   * @returns A [`BackupCodeResource`](https://clerk.com/docs/reference/types/backup-code-resource) object.
   */
  createBackupCode: () => Promise<BackupCodeResource>;

  get verifiedExternalAccounts(): ExternalAccountResource[];

  get unverifiedExternalAccounts(): ExternalAccountResource[];

  get verifiedWeb3Wallets(): Web3WalletResource[];

  get hasVerifiedEmailAddress(): boolean;

  get hasVerifiedPhoneNumber(): boolean;

  __internal_toSnapshot: () => UserJSONSnapshot;
}

/** @generateWithEmptyComment */
export type CreateEmailAddressParams = {
  /**
   * The email address to add to the user.
   */
  email: string;
};
/** @generateWithEmptyComment */
export type CreatePhoneNumberParams = {
  /**
   * The phone number to add to the user.
   */
  phoneNumber: string;
};
/** @generateWithEmptyComment */
export type CreateWeb3WalletParams = {
  /**
   * The Web3 wallet address, made up of either 0x + 40 hexadecimal characters or a `base58` encoded `ed25519` public key (for Solana wallets).
   */
  web3Wallet: string;
};
/** @generateWithEmptyComment */
export type SetProfileImageParams = {
  /**
   * The file to set as the user's profile image, or `null` to remove the current image.
   */
  file: Blob | File | string | null;
};
/** @generateWithEmptyComment */
export type CreateExternalAccountParams = {
  /**
   * The strategy corresponding to the OAuth provider. For example: `'oauth_google'`.
   */
  strategy?: OAuthStrategy;
  /**
   * The ID of the enterprise connection to connect to the user.
   */
  enterpriseConnectionId?: string;
  /**
   * The full URL or path that the OAuth provider should redirect to, on successful authorization on their part. Typically, this will be a simple `/sso-callback` route that calls [`Clerk.handleRedirectCallback`](https://clerk.com/docs/reference/objects/clerk#handle-redirect-callback) or mounts the [`<AuthenticateWithRedirectCallback />`](https://clerk.com/docs/reference/components/control/authenticate-with-redirect-callback) component. See the [custom flow](https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections) for implementation details.

   */
  redirectUrl?: string;
  /**
   * Additional scopes for your user to be prompted to approve.
   */
  additionalScopes?: OAuthScope[];
  /**
   * The value to pass to the [OIDC `prompt` parameter](https://openid.net/specs/openid-connect-core-1_0.html#:~:text=prompt,reauthentication%20and%20consent.) in the generated OAuth redirect URL.
   */
  oidcPrompt?: string;
  /**
   * The value to pass to the [OIDC `login_hint` parameter](https://openid.net/specs/openid-connect-core-1_0.html#:~:text=login_hint,in%20\(if%20necessary\).) in the generated OAuth redirect URL.
   */
  oidcLoginHint?: string;
};
/** @generateWithEmptyComment */
export type VerifyTOTPParams = {
  /**
   * The code to verify.
   */
  code: string;
};

type UpdateUserJSON = Pick<
  UserJSON,
  | 'username'
  | 'first_name'
  | 'last_name'
  | 'primary_email_address_id'
  | 'primary_phone_number_id'
  | 'primary_web3_wallet_id'
  | 'unsafe_metadata'
>;

export type UpdateUserParams = Partial<SnakeToCamel<UpdateUserJSON>>;

/** @generateWithEmptyComment */
export type UpdateUserMetadataParams = {
  /**
   * The metadata to deep-merge with the user's existing `unsafeMetadata`. Keys at any nesting level whose value is `null` are removed.
   */
  unsafeMetadata: UserUnsafeMetadata;
};

/** @generateWithEmptyComment */
export type UpdateUserPasswordParams = {
  /**
   * The user's new password.
   */
  newPassword: string;
  /**
   * The user's current password.
   */
  currentPassword?: string;
  /**
   * Whether to sign out the user from all their active sessions once their password is updated.
   */
  signOutOfOtherSessions?: boolean;
};

/** @generateWithEmptyComment */
export type RemoveUserPasswordParams = {
  /**
   * The user's current password.
   */
  currentPassword?: string;
};

/** @generateWithEmptyComment */
export type GetUserOrganizationInvitationsParams = ClerkPaginationParams<{
  /**
   * The status an invitation can have.
   */
  status?: OrganizationInvitationStatus;
}>;

/** @generateWithEmptyComment */
export type GetUserOrganizationSuggestionsParams = ClerkPaginationParams<{
  /**
   * The status a suggestion can have.
   */
  status?: OrganizationSuggestionStatus | OrganizationSuggestionStatus[];
}>;

export type GetUserOrganizationMembershipParams = ClerkPaginationParams;

/**
 * Gets a list of Organization memberships for the user.
 * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`OrganizationMembershipResource`](https://clerk.com/docs/reference/types/organization-membership) objects.
 */
export type GetOrganizationMemberships = (
  params?: GetUserOrganizationMembershipParams,
) => Promise<ClerkPaginatedResponse<OrganizationMembershipResource>>;

export type GetEnterpriseConnectionsParams = {
  withOrganizationAccountLinking?: boolean;
};
