import type { BillingPayerJSON, BillingPayerResource } from '@clerk/types';

import { unixEpochToDate } from '@/utils/date';

import { BaseResource } from './internal';

export class BillingPayer extends BaseResource implements BillingPayerResource {
  id!: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  imageUrl?: string | null;
  userId?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  organizationId?: string | null;
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
    this.createdAt =
      data.created_at === undefined ? undefined : data.created_at === null ? null : unixEpochToDate(data.created_at);
    this.updatedAt =
      data.updated_at === undefined ? undefined : data.updated_at === null ? null : unixEpochToDate(data.updated_at);
    this.imageUrl = data.image_url;
    this.userId = data.user_id ?? null;
    this.email = data.email ?? null;
    this.firstName = data.first_name ?? null;
    this.lastName = data.last_name ?? null;
    this.organizationId = data.organization_id ?? null;
    this.organizationName = data.organization_name ?? null;
    return this;
  }
}
