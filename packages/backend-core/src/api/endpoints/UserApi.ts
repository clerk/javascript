import { joinPaths } from '../../util/path';
import { User } from '../resources/User';
import { AbstractAPI } from './AbstractApi';

const basePath = '/users';

type UserCountParams = {
  emailAddress?: string[];
  phoneNumber?: string[];
  username?: string[];
  web3Wallet?: string[];
  query?: string;
  userId?: string[];
};

type UserListParams = UserCountParams & {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | '+created_at' | '+updated_at' | '-created_at' | '-updated_at';
};

const userMetadataKeys = ['publicMetadata', 'privateMetadata', 'unsafeMetadata'];

type UserMetadataParams = {
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
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
} & UserMetadataParams;

interface UpdateUserParams extends UserMetadataParams {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  primaryEmailAddressID?: string;
  primaryPhoneNumberID?: string;
}

type UserMetadataRequestBody = {
  publicMetadata?: string;
  privateMetadata?: string;
  unsafeMetadata?: string;
};

export class UserAPI extends AbstractAPI {
  public async getUserList(params: UserListParams = {}) {
    return this.APIClient.request<Array<User>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async getUser(userId: string) {
    this.requireId(userId);
    return this.APIClient.request<User>({
      method: 'GET',
      path: joinPaths(basePath, userId),
    });
  }

  public async createUser(params: CreateUserParams): Promise<User> {
    const { publicMetadata, privateMetadata, unsafeMetadata } = params;
    return this.APIClient.request({
      method: 'POST',
      path: basePath,
      bodyParams: {
        ...params,
        ...stringifyMetadataParams({
          publicMetadata,
          privateMetadata,
          unsafeMetadata,
        }),
      },
    });
  }

  public async updateUser(userId: string, params: UpdateUserParams = {}) {
    this.requireId(userId);
    const { publicMetadata, privateMetadata, unsafeMetadata } = params;

    return this.APIClient.request<User>({
      method: 'PATCH',
      path: joinPaths(basePath, userId),
      bodyParams: {
        ...params,
        ...stringifyMetadataParams({
          publicMetadata,
          privateMetadata,
          unsafeMetadata,
        }),
      },
    });
  }

  public async updateUserMetadata(userId: string, params: UserMetadataParams) {
    this.requireId(userId);

    return this.APIClient.request<User>({
      method: 'PATCH',
      path: joinPaths(basePath, userId, 'metadata'),
      bodyParams: stringifyMetadataParams(params),
    });
  }

  public async deleteUser(userId: string) {
    this.requireId(userId);
    return this.APIClient.request<User>({
      method: 'DELETE',
      path: joinPaths(basePath, userId),
    });
  }

  public async getCount(params: UserListParams = {}) {
    return this.APIClient.request<number>({
      method: 'GET',
      path: joinPaths(basePath, 'count'),
      queryParams: params,
    });
  }

  public async getUserOauthAccessToken(userId: string, provider: `oauth_${string}`) {
    this.requireId(userId);
    return this.APIClient.request<User>({
      method: 'GET',
      path: joinPaths(basePath, userId, 'oauth_access_tokens', provider),
    });
  }
}

function stringifyMetadataParams(
  params: UserMetadataParams & {
    [key: string]: Record<string, unknown> | undefined;
  },
): UserMetadataRequestBody {
  return userMetadataKeys.reduce((res: Record<string, string>, key: string): Record<string, string> => {
    if (params[key]) {
      res[key] = JSON.stringify(params[key]);
    }
    return res;
  }, {});
}
