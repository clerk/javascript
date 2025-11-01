import type { ApiKeyJSON, APIKeyResource } from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

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
  secret?: string;
  lastUsedAt!: Date | null;
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
    this.description = data.description;
    this.secret = data.secret;
    this.lastUsedAt = data.last_used_at ? unixEpochToDate(data.last_used_at) : null;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.createdAt = unixEpochToDate(data.created_at);
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
