import type { CommercePayerJSON, CommercePayerResource } from '@clerk/types';

import { unixEpochToDate } from '@/utils/date';

import { BaseResource } from './internal';

export class CommercePayer extends BaseResource implements CommercePayerResource {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  imageUrl!: string | null;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  organizationName?: string;

  constructor(data: CommercePayerJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommercePayerJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.imageUrl = data.image_url;
    this.userId = data.user_id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.organizationId = data.organization_id;
    this.organizationName = data.organization_name;
    return this;
  }
}
