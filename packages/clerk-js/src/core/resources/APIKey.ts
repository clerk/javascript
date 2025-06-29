import type { ApiKeyJSON, APIKeyResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON, serializeToJSON } from './parser';

export class APIKey extends BaseResource implements APIKeyResource {
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
  description!: string | null;
  lastUsedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: ApiKeyJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: ApiKeyJSON | null): this {
    Object.assign(
      this,
      parseJSON<APIKey>(data, {
        dateFields: ['expiration', 'lastUsedAt', 'createdAt', 'updatedAt'],
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): ApiKeyJSON {
    return {
      object: 'api_key',
      ...serializeToJSON(this),
    } as ApiKeyJSON;
  }
}
