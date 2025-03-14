import type { ClerkPaginatedResponse } from './pagination';
import type { ClerkResource } from './resource';

export interface __experimental_CommerceNamespace {
  __experimental_billing: __experimental_CommerceBillingNamespace;
  getPaymentSources: () => Promise<ClerkPaginatedResponse<__experimental_CommercePaymentSourceResource>>;
  addPaymentSource: (
    params: __experimental_AddPaymentSourceParams,
  ) => Promise<__experimental_CommercePaymentSourceResource>;
}

export interface __experimental_CommerceBillingNamespace {
  getPlans: () => Promise<__experimental_CommercePlanResource[]>;
  startCheckout: (params: __experimental_CreateCheckoutParams) => Promise<__experimental_CommerceCheckoutResource>;
}

export type __experimental_CommerceSubscriberType = 'org' | 'user';

export interface __experimental_CommerceProductResource extends ClerkResource {
  id: string;
  slug: string | null;
  currency: string;
  isDefault: boolean;
  plans: __experimental_CommercePlanResource[];
}

export interface __experimental_GetPlansParams {
  subscriberType?: __experimental_CommerceSubscriberType;
}

export interface __experimental_CommercePlanResource extends ClerkResource {
  id: string;
  name: string;
  amount: number;
  amountFormatted: string;
  annualMonthlyAmount: number;
  annualMonthlyAmountFormatted: string;
  currencySymbol: string;
  currency: string;
  description: string;
  isActiveForPayer: boolean;
  isRecurring: boolean;
  hasBaseFee: boolean;
  payerType: string[];
  publiclyVisible: boolean;
  slug: string;
  avatarUrl: string;
  features: __experimental_CommerceFeatureResource[];
}

export interface __experimental_CommerceFeatureResource extends ClerkResource {
  id: string;
  name: string;
  description: string;
  slug: string;
  avatarUrl: string;
}

export interface __experimental_AddPaymentSourceParams {
  gateway: 'stripe' | 'paypal';
  paymentMethod: string;
  paymentToken: string;
}

export interface __experimental_CommercePaymentSourceResource extends ClerkResource {
  id: string;
  last4: string;
  paymentMethod: string;
  cardType: string;
}

export interface __experimental_CommerceInvoiceResource extends ClerkResource {
  id: string;
  planId: string;
  paymentSourceId: string;
  totals: __experimental_CommerceTotals;
  paymentDueOn: number;
  paidOn: number;
  status: string;
}

export interface __experimental_CommerceSubscriptionResource extends ClerkResource {
  id: string;
  paymentSourceId: string;
  plan: __experimental_CommercePlanResource;
  planPeriod: string;
  status: string;
  cancel: () => Promise<any>;
}

export interface __experimental_CommerceMoney {
  amount: number;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
}

export interface __experimental_CommerceTotals {
  subtotal: __experimental_CommerceMoney;
  grandTotal: __experimental_CommerceMoney;
  taxTotal: __experimental_CommerceMoney;
  totalDueNow?: __experimental_CommerceMoney;
}

export interface __experimental_CreateCheckoutParams {
  planId: string;
  planPeriod: string;
}

export interface __experimental_ConfirmCheckoutParams {
  paymentSourceId?: string;
}

export interface __experimental_CommerceCheckoutResource extends ClerkResource {
  id: string;
  externalClientSecret: string;
  externalGatewayId: string;
  invoice?: __experimental_CommerceInvoiceResource;
  paymentSource?: __experimental_CommercePaymentSourceResource;
  plan: __experimental_CommercePlanResource;
  planPeriod: string;
  status: string;
  totals: __experimental_CommerceTotals;
  subscription?: __experimental_CommerceSubscriptionResource;
  confirm: (params?: __experimental_ConfirmCheckoutParams) => Promise<__experimental_CommerceCheckoutResource>;
}
