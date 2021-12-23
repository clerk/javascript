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

export class UserApi extends AbstractApi {
  public async getUserList(params: UserListParams = {}) {
    return this._restClient.makeRequest<Array<User>>({
      method: 'GET',
      path: '/users',
      queryParams: params,
    });
  }

  public async getUser(userId: string) {
    return this._restClient.makeRequest<User>({
      method: 'GET',
      path: `/users/${userId}`,
    });
  }

  public async updateUser(userId: string, params: UserParams = {}) {
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
    return this._restClient.makeRequest<User>({
      method: 'DELETE',
      path: `/users/${userId}`,
    });
  }
}
