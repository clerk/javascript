import type { CustomerType } from './json';
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

export interface PortalSessionResource extends ClerkResource {
  redirectUrl: string;
}

export type CreatePortalSessionParams = {
  return_url: string;
};

export interface CheckoutSessionResource extends ClerkResource {
  redirectUrl: string;
}

export type ChangePlanParams = {
  planKey: string;
};
