import type { ClerkPaginationRequest, OAuthProvider, OrganizationInvitationStatus } from '@clerk/types';

import { runtime } from '../../runtime';
import { joinPaths } from '../../util/path';
import { deprecated } from '../../util/shared';
import type {
  DeletedObject,
  OauthAccessToken,
  OrganizationInvitation,
  OrganizationMembership,
  User,
} from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/users';

type UserCountParams = {
  emailAddress?: string[];
  phoneNumber?: string[];
  username?: string[];
  web3Wallet?: string[];
  query?: string;
  userId?: string[];
  externalId?: string[];
};

type UserListParams = ClerkPaginationRequest<
  UserCountParams & {
    orderBy?: WithSign<
      | 'created_at'
      | 'updated_at'
      | 'email_address'
      | 'web3wallet'
      | 'first_name'
      | 'last_name'
      | 'phone_number'
      | 'username'
      | 'last_active_at'
      | 'last_sign_in_at'
    >;
    last_active_at_since?: number;
    organizationId?: string[];
  }
>;

type UserMetadataParams = {
  publicMetadata?: UserPublicMetadata;
  privateMetadata?: UserPrivateMetadata;
  unsafeMetadata?: UserUnsafeMetadata;
};

type PasswordHasher =
  | 'argon2i'
  | 'argon2id'
  | 'awscognito'
  | 'bcrypt'
  | 'bcrypt_sha256_django'
  | 'md5'
  | 'pbkdf2_sha256'
  | 'pbkdf2_sha256_django'
  | 'pbkdf2_sha1'
  | 'phpass'
  | 'scrypt_firebase'
  | 'scrypt_werkzeug'
  | 'sha256'
  | 'md5_phpass'
  | 'ldap_ssha';

type UserPasswordHashingParams = {
  passwordDigest: string;
  passwordHasher: PasswordHasher;
};

type CreateUserParams = {
  externalId?: string;
  emailAddress?: string[];
  phoneNumber?: string[];
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  skipPasswordChecks?: boolean;
  skipPasswordRequirement?: boolean;
  skipLegalChecks?: boolean;
  legalAcceptedAt?: Date;
  totpSecret?: string;
  backupCodes?: string[];
  createdAt?: Date;
} & UserMetadataParams &
  (UserPasswordHashingParams | object);

type UpdateUserParams = {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  skipPasswordChecks?: boolean;
  signOutOfOtherSessions?: boolean;
  primaryEmailAddressID?: string;
  primaryPhoneNumberID?: string;
  primaryWeb3WalletID?: string;
  profileImageID?: string;
  totpSecret?: string;
  backupCodes?: string[];
  externalId?: string;
  createdAt?: Date;
  skipLegalChecks?: boolean;
  legalAcceptedAt?: Date;
  deleteSelfEnabled?: boolean;
  createOrganizationEnabled?: boolean;
  createOrganizationsLimit?: number;
} & UserMetadataParams &
  (UserPasswordHashingParams | object);

type GetOrganizationMembershipListParams = ClerkPaginationRequest<{
  userId: string;
}>;

type GetOrganizationInvitationListParams = ClerkPaginationRequest<{
  userId: string;
  status?: OrganizationInvitationStatus;
}>;

type VerifyPasswordParams = {
  userId: string;
  password: string;
};

type VerifyTOTPParams = {
  userId: string;
  code: string;
};

type DeleteUserPasskeyParams = {
  userId: string;
  passkeyIdentificationId: string;
};

type DeleteWeb3WalletParams = {
  userId: string;
  web3WalletIdentificationId: string;
};

type DeleteUserExternalAccountParams = {
  userId: string;
  externalAccountId: string;
};

type UserID = {
  userId: string;
};

export class UserAPI extends AbstractAPI {
  public async getUserList(params: UserListParams = {}) {
    const { limit, offset, orderBy, ...userCountParams } = params;
    // TODO(dimkl): Temporary change to populate totalCount using a 2nd BAPI call to /users/count endpoint
    // until we update the /users endpoint to be paginated in a next BAPI version.
    // In some edge cases the data.length != totalCount due to a creation of a user between the 2 api responses
    const [data, totalCount] = await Promise.all([
      this.request<User[]>({
        method: 'GET',
        path: basePath,
        queryParams: params,
      }),
      this.getCount(userCountParams),
    ]);
    return { data, totalCount } as PaginatedResourceResponse<User[]>;
  }

  public async getUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'GET',
      path: joinPaths(basePath, userId),
    });
  }

  public async createUser(params: CreateUserParams) {
    return this.request<User>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updateUser(userId: string, params: UpdateUserParams = {}) {
    this.requireId(userId);

    return this.request<User>({
      method: 'PATCH',
      path: joinPaths(basePath, userId),
      bodyParams: params,
    });
  }

  public async updateUserProfileImage(userId: string, params: { file: Blob | File }) {
    this.requireId(userId);

    const formData = new runtime.FormData();
    formData.append('file', params?.file);

    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'profile_image'),
      formData,
    });
  }

  public async updateUserMetadata(userId: string, params: UserMetadataParams) {
    this.requireId(userId);

    return this.request<User>({
      method: 'PATCH',
      path: joinPaths(basePath, userId, 'metadata'),
      bodyParams: params,
    });
  }

  public async deleteUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'DELETE',
      path: joinPaths(basePath, userId),
    });
  }

  public async getCount(params: UserCountParams = {}) {
    return this.request<number>({
      method: 'GET',
      path: joinPaths(basePath, 'count'),
      queryParams: params,
    });
  }

  /** @deprecated Please use getUserOauthAccessToken without the `oauth_` provider prefix . */
  public async getUserOauthAccessToken(
    userId: string,
    provider: `oauth_${OAuthProvider}`,
  ): Promise<PaginatedResourceResponse<OauthAccessToken[]>>;
  public async getUserOauthAccessToken(
    userId: string,
    provider: OAuthProvider,
  ): Promise<PaginatedResourceResponse<OauthAccessToken[]>>;
  public async getUserOauthAccessToken(userId: string, provider: `oauth_${OAuthProvider}` | OAuthProvider) {
    this.requireId(userId);
    const hasPrefix = provider.startsWith('oauth_');
    const _provider = hasPrefix ? provider : `oauth_${provider}`;

    if (hasPrefix) {
      deprecated(
        'getUserOauthAccessToken(userId, provider)',
        'Remove the `oauth_` prefix from the `provider` argument.',
      );
    }

    return this.request<PaginatedResourceResponse<OauthAccessToken[]>>({
      method: 'GET',
      path: joinPaths(basePath, userId, 'oauth_access_tokens', _provider),
      queryParams: { paginated: true },
    });
  }

  public async disableUserMFA(userId: string) {
    this.requireId(userId);
    return this.request<UserID>({
      method: 'DELETE',
      path: joinPaths(basePath, userId, 'mfa'),
    });
  }

  public async getOrganizationMembershipList(params: GetOrganizationMembershipListParams) {
    const { userId, limit, offset } = params;
    this.requireId(userId);

    return this.request<PaginatedResourceResponse<OrganizationMembership[]>>({
      method: 'GET',
      path: joinPaths(basePath, userId, 'organization_memberships'),
      queryParams: { limit, offset },
    });
  }

  public async getOrganizationInvitationList(params: GetOrganizationInvitationListParams) {
    const { userId, ...queryParams } = params;
    this.requireId(userId);

    return this.request<PaginatedResourceResponse<OrganizationInvitation[]>>({
      method: 'GET',
      path: joinPaths(basePath, userId, 'organization_invitations'),
      queryParams,
    });
  }

  public async verifyPassword(params: VerifyPasswordParams) {
    const { userId, password } = params;
    this.requireId(userId);

    return this.request<{ verified: true }>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'verify_password'),
      bodyParams: { password },
    });
  }

  public async verifyTOTP(params: VerifyTOTPParams) {
    const { userId, code } = params;
    this.requireId(userId);

    return this.request<{ verified: true; code_type: 'totp' }>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'verify_totp'),
      bodyParams: { code },
    });
  }

  public async banUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'ban'),
    });
  }

  public async unbanUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'unban'),
    });
  }

  public async lockUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'lock'),
    });
  }

  public async unlockUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'unlock'),
    });
  }

  public async deleteUserProfileImage(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'DELETE',
      path: joinPaths(basePath, userId, 'profile_image'),
    });
  }

  public async deleteUserPasskey(params: DeleteUserPasskeyParams) {
    this.requireId(params.userId);
    this.requireId(params.passkeyIdentificationId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, params.userId, 'passkeys', params.passkeyIdentificationId),
    });
  }

  public async deleteUserWeb3Wallet(params: DeleteWeb3WalletParams) {
    this.requireId(params.userId);
    this.requireId(params.web3WalletIdentificationId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, params.userId, 'web3_wallets', params.web3WalletIdentificationId),
    });
  }

  public async deleteUserExternalAccount(params: DeleteUserExternalAccountParams) {
    this.requireId(params.userId);
    this.requireId(params.externalAccountId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, params.userId, 'external_accounts', params.externalAccountId),
    });
  }

  public async deleteUserBackupCodes(userId: string) {
    this.requireId(userId);
    return this.request<UserID>({
      method: 'DELETE',
      path: joinPaths(basePath, userId, 'backup_code'),
    });
  }

  public async deleteUserTOTP(userId: string) {
    this.requireId(userId);
    return this.request<UserID>({
      method: 'DELETE',
      path: joinPaths(basePath, userId, 'totp'),
    });
  }
}
