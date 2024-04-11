import type { BillingPlanResource, CustomerType } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class BillingPlan extends BaseResource implements BillingPlanResource {
  id: string;
  name: string;
  description: string;
  key: string;
  customerType: CustomerType;
  priceInCents: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;

  protected fromJSON(data: any): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.key = data.key;
    this.customerType = data.customer_type;
    this.priceInCents = data.price_in_cents;
    this.features = data.features;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);

    return this;
  }
}
