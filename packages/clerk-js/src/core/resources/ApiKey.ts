import type { ApiKeyJSON, ApiKeyResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class ApiKey extends BaseResource implements ApiKeyResource {
  pathRoot = '/api_keys';

  id = '';
  type = '';
  name = '';
  subject = '';
  scopes: string[] = [];
  claims: Record<string, any> | null = null;
  revoked = false;
  revocationReason: string | null = null;
  expired = false;
  expiration: Date | null = null;
  createdBy: string | null = null;
  creationReason: string | null = null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: ApiKeyJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: ApiKeyJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.expiration = data.expiration ? unixEpochToDate(data.expiration) : null;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.createdAt = unixEpochToDate(data.created_at);
    return this;
  }

  static async getAll(): Promise<ApiKeyResource[]> {
    return this.clerk
      .getFapiClient()
      .request<ApiKeyJSON[]>({
        method: 'GET',
        path: '/api_keys',
        pathPrefix: '',
        search: {
          subject: this.clerk.user?.id ?? '',
        },
        headers: {
          Authorization: `Bearer ${await this.clerk.session?.getToken()}`,
        },
      })
      .then(res => {
        const apiKeysJSON = res.payload as unknown as ApiKeyJSON[];
        return apiKeysJSON.map(json => new ApiKey(json));
      })
      .catch(() => []);
  }
}
