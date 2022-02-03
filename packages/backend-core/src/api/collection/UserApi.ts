import { User } from '../resources/User';
import { AbstractApi } from './AbstractApi';

interface UserParams {
  firstName?: string;
  lastName?: string;
  password?: string;
  primaryEmailAddressID?: string;
  primaryPhoneNumberID?: string;
  publicMetadata?: Record<string, unknown> | string;
  privateMetadata?: Record<string, unknown> | string;
}

interface UserListParams {
  limit?: number;
  offset?: number;
  emailAddress?: string[];
  phoneNumber?: string[];
  userId?: string[];
  orderBy?:
    | 'created_at'
    | 'updated_at'
    | '+created_at'
    | '+updated_at'
    | '-created_at'
    | '-updated_at';
}

const userMetadataKeys = [
  'publicMetadata',
  'privateMetadata',
  'unsafeMetadata',
];

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
        ...sanitizeMetadataParams({
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

    if (
      params.privateMetadata &&
      !(typeof params.privateMetadata == 'string')
    ) {
      params.privateMetadata = JSON.stringify(params.privateMetadata);
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
}

function sanitizeMetadataParams(
  params: UserMetadataParams & {
    [key: string]: Record<string, unknown> | undefined;
  }
): UserMetadataRequestBody {
  return userMetadataKeys.reduce(
    (res: Record<string, string>, key: string): Record<string, string> => {
      if (params[key]) {
        res[key] = JSON.stringify(params[key]);
      }
      return res;
    },
    {}
  );
}
