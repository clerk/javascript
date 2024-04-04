import type { ClerkResource } from './resource';

export type BillingCycle = {
  startDate: Date;
  endDate: Date;
};
export interface BillingPlanResource extends ClerkResource {
  id: string;
  name: string;
  description: string | null;
  key: string;
  priceInCents: number;
  features: string[];
  billingCycle: BillingCycle;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortalSessionResource extends ClerkResource {
  redirectUrl: string;
}

export type CreatePortalSessionParams = {
  returnUrl: string;
};

export interface CheckoutSessionResource extends ClerkResource {
  redirectUrl: string;
}

export type ChangePlanParams = {
  planKey: string;
};

export type BillingData = {
  enabled: boolean;
};
