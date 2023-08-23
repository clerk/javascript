import type { ClerkPaginatedResponse } from './api';
import type { BackupCodeResource } from './backupCode';
import type { DeletedObjectResource } from './deletedObject';
import type { EmailAddressResource } from './emailAddress';
import type { ExternalAccountResource } from './externalAccount';
import type { ImageResource } from './image';
import type { UserJSON } from './json';
import type { OAuthScope } from './oauth';
import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { OrganizationMembershipResource } from './organizationMembership';
import type { OrganizationSuggestionResource, OrganizationSuggestionStatus } from './organizationSuggestion';
import type { PhoneNumberResource } from './phoneNumber';
import type { ClerkResource } from './resource';
import type { SamlAccountResource } from './samlAccount';
import type { SessionWithActivitiesResource } from './session';
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

export interface UserResource extends ClerkResource {
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
  /**
   * @deprecated  Use `imageUrl` instead.
   */
  profileImageUrl: string;
  imageUrl: string;
  hasImage: boolean;
  emailAddresses: EmailAddressResource[];
  phoneNumbers: PhoneNumberResource[];
  web3Wallets: Web3WalletResource[];
  externalAccounts: ExternalAccountResource[];

  /**
   * @experimental
   */
  samlAccounts: SamlAccountResource[];

  organizationMemberships: OrganizationMembershipResource[];
  passwordEnabled: boolean;
  totpEnabled: boolean;
  backupCodeEnabled: boolean;
  twoFactorEnabled: boolean;
  publicMetadata: UserPublicMetadata;
  unsafeMetadata: UserUnsafeMetadata;
  lastSignInAt: Date | null;
  createOrganizationEnabled: boolean;
  deleteSelfEnabled: boolean;
  updatedAt: Date | null;
  createdAt: Date | null;

  update: (params: UpdateUserParams) => Promise<UserResource>;
  delete: () => Promise<void>;
  updatePassword: (params: UpdateUserPasswordParams) => Promise<UserResource>;
  removePassword: (params: RemoveUserPasswordParams) => Promise<UserResource>;
  createEmailAddress: (params: CreateEmailAddressParams) => Promise<EmailAddressResource>;
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
  createTOTP: () => Promise<TOTPResource>;
  verifyTOTP: (params: VerifyTOTPParams) => Promise<TOTPResource>;
  disableTOTP: () => Promise<DeletedObjectResource>;
  createBackupCode: () => Promise<BackupCodeResource>;

  get verifiedExternalAccounts(): ExternalAccountResource[];

  get unverifiedExternalAccounts(): ExternalAccountResource[];

  get hasVerifiedEmailAddress(): boolean;

  get hasVerifiedPhoneNumber(): boolean;
}

export type CreateEmailAddressParams = { email: string };
export type CreatePhoneNumberParams = { phoneNumber: string };
export type CreateWeb3WalletParams = { web3Wallet: string };
export type SetProfileImageParams = { file: Blob | File | string | null };
export type CreateExternalAccountParams = {
  strategy: OAuthStrategy;
  redirectUrl?: string;
  additionalScopes?: OAuthScope[];
  /**
   * @deprecated Use `redirectUrl` instead.
   */
  redirect_url?: string;
};
export type VerifyTOTPParams = { code: string };

type UpdateUserJSON = Pick<
  UserJSON,
  | 'username'
  | 'password'
  | 'first_name'
  | 'last_name'
  | 'primary_email_address_id'
  | 'primary_phone_number_id'
  | 'primary_web3_wallet_id'
  | 'unsafe_metadata'
>;

export type UpdateUserParams = Partial<
  SnakeToCamel<UpdateUserJSON> & {
    /**
     * @deprecated This will be removed in the next major version. Please use `updatePassword(params)` instead
     */
    password: string;
  }
>;

export type UpdateUserPasswordParams = {
  newPassword: string;
  currentPassword?: string;
  signOutOfOtherSessions?: boolean;
};

export type RemoveUserPasswordParams = Pick<UpdateUserPasswordParams, 'currentPassword'>;

export type GetUserOrganizationInvitationsParams = {
  /**
   * This the starting point for your fetched results. The initial value persists between re-renders
   */
  initialPage?: number;
  /**
   * Maximum number of items returned per request. The initial value persists between re-renders
   */
  pageSize?: number;

  status?: OrganizationInvitationStatus;
};

export type GetUserOrganizationSuggestionsParams = {
  /**
   * This the starting point for your fetched results. The initial value persists between re-renders
   */
  initialPage?: number;
  /**
   * Maximum number of items returned per request. The initial value persists between re-renders
   */
  pageSize?: number;

  status?: OrganizationSuggestionStatus | OrganizationSuggestionStatus[];
};

type GetUserOrganizationMembershipOldParams = {
  limit?: number;
  offset?: number;
};

export type GetUserOrganizationMembershipParams = {
  /**
   * This the starting point for your fetched results. The initial value persists between re-renders
   */
  initialPage?: number;
  /**
   * Maximum number of items returned per request. The initial value persists between re-renders
   */
  pageSize?: number;
};

type MembershipParams = (GetUserOrganizationMembershipOldParams | GetUserOrganizationMembershipParams) & {
  paginated?: boolean;
};

export type GetOrganizationMemberships = <T extends MembershipParams>(
  params?: T,
) => T['paginated'] extends true
  ? Promise<ClerkPaginatedResponse<OrganizationMembershipResource>>
  : Promise<OrganizationMembershipResource[]>;
