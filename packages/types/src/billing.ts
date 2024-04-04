import type { ClerkResource } from './resource';

export type BillingCycle = {
  startDate: Date;
  endDate: Date;
};

export type PaymentMethod = {
  type: string;
  id: string;
  createdAt: Date;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
};

export interface BillingPlanResource extends ClerkResource {
  id: string;
  name: string;
  description: string | null;
  key: string;
  priceInCents: number;
  features: string[];
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod | null;
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
  successReturnURL: string;
  cancelReturnURL: string;
};

export type BillingData = {
  enabled: boolean;
};
