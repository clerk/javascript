import type { ClerkPaginationRequest, OAuthProvider } from '@clerk/types';

import runtime from '../../runtime';
import { joinPaths } from '../../util/path';
import type { OauthAccessToken, OrganizationMembership, User } from '../resources';
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
  | 'bcrypt'
  | 'bcrypt_sha256_django'
  | 'md5'
  | 'pbkdf2_sha256'
  | 'pbkdf2_sha256_django'
  | 'pbkdf2_sha1'
  | 'phpass'
  | 'scrypt_firebase'
  | 'scrypt_werkzeug'
  | 'sha256';

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
  createOrganizationEnabled?: boolean;
  createOrganizationsLimit?: number;
} & UserMetadataParams &
  (UserPasswordHashingParams | object);

type GetOrganizationMembershipListParams = ClerkPaginationRequest<{
  userId: string;
}>;

type VerifyPasswordParams = {
  userId: string;
  password: string;
};

type VerifyTOTPParams = {
  userId: string;
  code: string;
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

  public async getUserOauthAccessToken(userId: string, provider: `oauth_${OAuthProvider}`) {
    this.requireId(userId);
    return this.request<PaginatedResourceResponse<OauthAccessToken[]>>({
      method: 'GET',
      path: joinPaths(basePath, userId, 'oauth_access_tokens', provider),
      queryParams: { paginated: true },
    });
  }

  public async disableUserMFA(userId: string) {
    this.requireId(userId);
    return this.request<User>({
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
}
