import type { ApiKeyJSON, ApiKeyResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class ApiKey extends BaseResource implements ApiKeyResource {
  pathRoot = '/api_keys';

  id!: string;
  type!: string;
  name!: string;
  subject!: string;
  scopes!: string[];
  claims!: Record<string, any> | null;
  revoked!: boolean;
  revocationReason!: string | null;
  expired!: boolean;
  expiration!: Date | null;
  createdBy!: string | null;
  creationReason!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: ApiKeyJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: ApiKeyJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.type = data.type;
    this.name = data.name;
    this.subject = data.subject;
    this.scopes = data.scopes;
    this.claims = data.claims;
    this.revoked = data.revoked;
    this.revocationReason = data.revocation_reason;
    this.expired = data.expired;
    this.expiration = data.expiration ? unixEpochToDate(data.expiration) : null;
    this.createdBy = data.created_by;
    this.creationReason = data.creation_reason;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.createdAt = unixEpochToDate(data.created_at);
    return this;
  }

  static async getAll(): Promise<ApiKeyResource[]> {
    return this.clerk
      .getFapiClient()
      .request<{ api_keys: ApiKeyJSON[] }>({
        method: 'GET',
        path: '/api_keys',
        pathPrefix: '',
        search: {
          subject: this.clerk.user?.id ?? '',
        },
        headers: {
          Authorization: `Bearer ${await this.clerk.session?.getToken()}`,
        },
        credentials: 'same-origin',
      })
      .then(res => {
        const apiKeysJSON = res.payload as unknown as { api_keys: ApiKeyJSON[] };
        return apiKeysJSON.api_keys.map(json => new ApiKey(json));
      })
      .catch(() => []);
  }

  static async getSecret(id: string): Promise<string> {
    return this.clerk
      .getFapiClient()
      .request<{ secret: string }>({
        method: 'GET',
        path: `/api_keys/${id}/secret`,
        credentials: 'same-origin',
        pathPrefix: '',
        headers: {
          Authorization: `Bearer ${await this.clerk.session?.getToken()}`,
        },
      })
      .then(res => {
        return (res.payload as any)?.secret ?? '';
      })
      .catch(() => '');
  }
}
