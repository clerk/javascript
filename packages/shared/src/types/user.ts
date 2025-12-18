import type { BackupCodeResource } from './backupCode';
import type { BillingPayerMethods } from './billing';
import type { DeletedObjectResource } from './deletedObject';
import type { EmailAddressResource } from './emailAddress';
import type { EnterpriseAccountResource } from './enterpriseAccount';
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
 * The `User` object holds all of the information for a single user of your application and provides a set of methods to manage their account.
 *
 * A user can be contacted at their primary email address or primary phone number. They can have more than one registered email address, but only one of them will be their primary email address. This goes for phone numbers as well; a user can have more than one, but only one phone number will be their primary. At the same time, a user can also have one or more external accounts by connecting to [social providers](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/overview) such as Google, Apple, Facebook, and many more.
 *
 * Finally, a `User` object holds profile data like the user's name, profile picture, and a set of [metadata](/docs/guides/users/extending) that can be used internally to store arbitrary information. The metadata are split into `publicMetadata` and `privateMetadata`. Both types are set from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}, but public metadata can also be accessed from the [Frontend API](https://clerk.com/docs/reference/frontend-api){{ target: '_blank' }}.
 *
 * The ClerkJS SDK provides some helper [methods](#methods) on the `User` object to help retrieve and update user information and authentication status.
 */
export interface UserResource extends ClerkResource, BillingPayerMethods {
  id: string;
  externalId: string | null;
  primaryEmailAddressId: string | null;
  primaryEmailAddress: EmailAddressResource | null;
  primaryPhoneNumberId: string | null;
  primaryPhoneNumber: PhoneNumberResource | null;
  primaryWeb3WalletId: string | null;
  primaryWeb3Wallet: Web3WalletResource | null;
  username: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  hasImage: boolean;
  emailAddresses: EmailAddressResource[];
  phoneNumbers: PhoneNumberResource[];
  web3Wallets: Web3WalletResource[];
  externalAccounts: ExternalAccountResource[];
  enterpriseAccounts: EnterpriseAccountResource[];
  passkeys: PasskeyResource[];
  organizationMemberships: OrganizationMembershipResource[];
  passwordEnabled: boolean;
  totpEnabled: boolean;
  backupCodeEnabled: boolean;
  twoFactorEnabled: boolean;
  publicMetadata: UserPublicMetadata;
  unsafeMetadata: UserUnsafeMetadata;
  lastSignInAt: Date | null;
  legalAcceptedAt: Date | null;
  createOrganizationEnabled: boolean;
  createOrganizationsLimit: number | null;
  deleteSelfEnabled: boolean;
  updatedAt: Date | null;
  createdAt: Date | null;

  update: (params: UpdateUserParams) => Promise<UserResource>;
  delete: () => Promise<void>;
  updatePassword: (params: UpdateUserPasswordParams) => Promise<UserResource>;
  removePassword: (params: RemoveUserPasswordParams) => Promise<UserResource>;
  createEmailAddress: (params: CreateEmailAddressParams) => Promise<EmailAddressResource>;
  createPasskey: () => Promise<PasskeyResource>;
  createPhoneNumber: (params: CreatePhoneNumberParams) => Promise<PhoneNumberResource>;
  createWeb3Wallet: (params: CreateWeb3WalletParams) => Promise<Web3WalletResource>;
  isPrimaryIdentification: (ident: EmailAddressResource | PhoneNumberResource | Web3WalletResource) => boolean;
  getSessions: () => Promise<SessionWithActivitiesResource[]>;
  setProfileImage: (params: SetProfileImageParams) => Promise<ImageResource>;
  createExternalAccount: (params: CreateExternalAccountParams) => Promise<ExternalAccountResource>;
  getOrganizationMemberships: GetOrganizationMemberships;
  getOrganizationInvitations: (
    params?: GetUserOrganizationInvitationsParams,
  ) => Promise<ClerkPaginatedResponse<UserOrganizationInvitationResource>>;
  getOrganizationSuggestions: (
    params?: GetUserOrganizationSuggestionsParams,
  ) => Promise<ClerkPaginatedResponse<OrganizationSuggestionResource>>;
  getOrganizationCreationDefaults: () => Promise<OrganizationCreationDefaultsResource>;
  leaveOrganization: (organizationId: string) => Promise<DeletedObjectResource>;
  createTOTP: () => Promise<TOTPResource>;
  verifyTOTP: (params: VerifyTOTPParams) => Promise<TOTPResource>;
  disableTOTP: () => Promise<DeletedObjectResource>;
  createBackupCode: () => Promise<BackupCodeResource>;

  get verifiedExternalAccounts(): ExternalAccountResource[];

  get unverifiedExternalAccounts(): ExternalAccountResource[];

  get verifiedWeb3Wallets(): Web3WalletResource[];

  get hasVerifiedEmailAddress(): boolean;

  get hasVerifiedPhoneNumber(): boolean;

  __internal_toSnapshot: () => UserJSONSnapshot;
}

export type CreateEmailAddressParams = { email: string };
export type CreatePhoneNumberParams = { phoneNumber: string };
export type CreateWeb3WalletParams = { web3Wallet: string };
export type SetProfileImageParams = { file: Blob | File | string | null };
export type CreateExternalAccountParams = {
  strategy: OAuthStrategy;
  redirectUrl?: string;
  additionalScopes?: OAuthScope[];
  oidcPrompt?: string;
  oidcLoginHint?: string;
};
export type VerifyTOTPParams = { code: string };

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

export type UpdateUserPasswordParams = {
  newPassword: string;
  currentPassword?: string;
  signOutOfOtherSessions?: boolean;
};

export type RemoveUserPasswordParams = Pick<UpdateUserPasswordParams, 'currentPassword'>;

export type GetUserOrganizationInvitationsParams = ClerkPaginationParams<{
  status?: OrganizationInvitationStatus;
}>;

export type GetUserOrganizationSuggestionsParams = ClerkPaginationParams<{
  status?: OrganizationSuggestionStatus | OrganizationSuggestionStatus[];
}>;

export type GetUserOrganizationMembershipParams = ClerkPaginationParams;

export type GetOrganizationMemberships = (
  params?: GetUserOrganizationMembershipParams,
) => Promise<ClerkPaginatedResponse<OrganizationMembershipResource>>;
