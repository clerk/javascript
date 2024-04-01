import type { CustomerType } from 'json';

import type { ClerkResource } from './resource';

export interface BillingPlanResource extends ClerkResource {
  id: string;
  name: string;
  description: string | null;
  key: string;
  customerType: CustomerType;
  priceInCents: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}
