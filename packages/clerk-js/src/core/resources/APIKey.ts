import type { ApiKeyJSON, APIKeyResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

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
        defaultValues: {
          claims: null,
          revocationReason: null,
          expiration: null,
          createdBy: null,
          description: null,
          lastUsedAt: null,
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): ApiKeyJSON {
    return {
      object: 'api_key',
      id: this.id,
      type: this.type,
      name: this.name,
      subject: this.subject,
      scopes: this.scopes,
      claims: this.claims,
      revoked: this.revoked,
      revocation_reason: this.revocationReason,
      expired: this.expired,
      expiration: this.expiration ? this.expiration.getTime() : null,
      created_by: this.createdBy,
      description: this.description,
      last_used_at: this.lastUsedAt ? this.lastUsedAt.getTime() : null,
      created_at: this.createdAt.getTime(),
      updated_at: this.updatedAt.getTime(),
    };
  }
}
