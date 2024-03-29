import type { CustomerType } from 'json';

import type { ClerkResource } from './resource';

export interface BillingPlanResource extends ClerkResource {
  id: string;
  name: string;
  description: string;
  key: string;
  customerType: CustomerType;
  price_in_cents: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}
