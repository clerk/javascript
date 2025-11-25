import type { BillingPayerJSON, BillingPayerResource } from '@clerk/shared/types';

import { unixEpochToDate } from '@/utils/date';

import { BaseResource } from './internal';

export class BillingPayer extends BaseResource implements BillingPayerResource {
  id!: string;
  createdAt?: Date;
  updatedAt?: Date;
  imageUrl?: string;
  userId: string | null = null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  organizationId: string | null = null;
  organizationName?: string | null;

  constructor(data: BillingPayerJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingPayerJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    if (data.created_at) {
      this.createdAt = unixEpochToDate(data.created_at);
    }
    if (data.updated_at) {
      this.updatedAt = unixEpochToDate(data.updated_at);
    }
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
