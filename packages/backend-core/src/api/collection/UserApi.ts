import { User } from '../resources/User';
import { AbstractApi } from './AbstractApi';

interface UserParams {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  primaryEmailAddressID?: string;
  primaryPhoneNumberID?: string;
  publicMetadata?: Record<string, unknown> | string;
  privateMetadata?: Record<string, unknown> | string;
  unsafeMetadata?: Record<string, unknown> | string;
}

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

type UserMetadataRequestBody = {
  publicMetadata?: string;
  privateMetadata?: string;
  unsafeMetadata?: string;
};

export class UserApi extends AbstractApi {
  public async getUserList(params: UserListParams = {}) {
    return this._restClient.makeRequest<Array<User>>({
      method: 'GET',
      path: '/users',
      queryParams: params,
    });
  }

  public async getUser(userId: string) {
    this.requireId(userId);
    return this._restClient.makeRequest<User>({
      method: 'GET',
      path: `/users/${userId}`,
    });
  }

  public async createUser(params: CreateUserParams): Promise<User> {
    const { publicMetadata, privateMetadata, unsafeMetadata } = params;
    return this._restClient.makeRequest({
      method: 'POST',
      path: '/users',
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

  public async updateUser(userId: string, params: UserParams = {}) {
    this.requireId(userId);

    // The Clerk server API requires metadata fields to be stringified
    if (params.publicMetadata && !(typeof params.publicMetadata == 'string')) {
      params.publicMetadata = JSON.stringify(params.publicMetadata);
    }

    if (params.privateMetadata && !(typeof params.privateMetadata == 'string')) {
      params.privateMetadata = JSON.stringify(params.privateMetadata);
    }

    if (params.unsafeMetadata && !(typeof params.unsafeMetadata == 'string')) {
      params.unsafeMetadata = JSON.stringify(params.unsafeMetadata);
    }

    return this._restClient.makeRequest<User>({
      method: 'PATCH',
      path: `/users/${userId}`,
      bodyParams: params,
    });
  }

  public async deleteUser(userId: string) {
    this.requireId(userId);
    return this._restClient.makeRequest<User>({
      method: 'DELETE',
      path: `/users/${userId}`,
    });
  }

  public async getCount(params: UserListParams = {}) {
    return this._restClient.makeRequest<number>({
      method: 'GET',
      path: '/users/count',
      queryParams: params,
    });
  }

  public async getUserOauthAccessTokens(userId: string, provider: `oauth_${string}`) {
    this.requireId(userId);
    return this._restClient.makeRequest<User>({
      method: 'GET',
      path: `/users/${userId}/oauth_access_tokens/${provider}`,
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
