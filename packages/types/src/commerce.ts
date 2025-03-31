import type { DeletedObjectResource } from './deletedObject';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';

export interface __experimental_CommerceNamespace {
  __experimental_billing: __experimental_CommerceBillingNamespace;
  getPaymentSources: (
    params: __experimental_GetPaymentSourcesParams,
  ) => Promise<ClerkPaginatedResponse<__experimental_CommercePaymentSourceResource>>;
  initializePaymentSource: (
    params: __experimental_InitializePaymentSourceParams,
  ) => Promise<__experimental_CommerceInitializedPaymentSourceResource>;
  addPaymentSource: (
    params: __experimental_AddPaymentSourceParams,
  ) => Promise<__experimental_CommercePaymentSourceResource>;
}

export interface __experimental_CommerceBillingNamespace {
  getPlans: () => Promise<__experimental_CommercePlanResource[]>;
  getSubscriptions: (
    params?: __experimental_GetSubscriptionsParams,
  ) => Promise<ClerkPaginatedResponse<__experimental_CommerceSubscriptionResource>>;
  startCheckout: (params: __experimental_CreateCheckoutParams) => Promise<__experimental_CommerceCheckoutResource>;
}

export type __experimental_CommerceSubscriberType = 'org' | 'user';
export type __experimental_CommerceSubscriptionStatus = 'active' | 'canceled';
export type __experimental_CommerceSubscriptionPlanPeriod = 'month' | 'annual';

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
  isRecurring: boolean;
  hasBaseFee: boolean;
  payerType: string[];
  publiclyVisible: boolean;
  slug: string;
  avatarUrl: string;
  features: __experimental_CommerceFeatureResource[];
  subscriptionIdForCurrentSubscriber: string | undefined;
}

export interface __experimental_CommerceFeatureResource extends ClerkResource {
  id: string;
  name: string;
  description: string;
  slug: string;
  avatarUrl: string;
}

export type __experimental_CommercePaymentSourceStatus = 'active' | 'expired' | 'disconnected';

export interface __experimental_InitializePaymentSourceParams {
  gateway: 'stripe' | 'paypal';
}

export interface __experimental_AddPaymentSourceParams {
  gateway: 'stripe' | 'paypal';
  paymentMethod: string;
  paymentToken: string;
}

export interface __experimental_GetPaymentSourcesParams {
  orgId?: string;
}

export interface __experimental_CommercePaymentSourceResource extends ClerkResource {
  id: string;
  last4: string;
  paymentMethod: string;
  cardType: string;
  isDefault: boolean;
  status: __experimental_CommercePaymentSourceStatus;
  remove: () => Promise<DeletedObjectResource>;
}

export interface __experimental_CommerceInitializedPaymentSourceResource extends ClerkResource {
  externalClientSecret: string;
  externalGatewayId: string;
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

export type __experimental_GetSubscriptionsParams = ClerkPaginationParams<{
  status?: __experimental_CommerceSubscriptionStatus;
}>;

export interface __experimental_CommerceSubscriptionResource extends ClerkResource {
  id: string;
  paymentSourceId: string;
  plan: __experimental_CommercePlanResource;
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  status: __experimental_CommerceSubscriptionStatus;
  cancel: () => Promise<DeletedObjectResource>;
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
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  orgId?: string;
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
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  status: string;
  totals: __experimental_CommerceTotals;
  subscription?: __experimental_CommerceSubscriptionResource;
  confirm: (params?: __experimental_ConfirmCheckoutParams) => Promise<__experimental_CommerceCheckoutResource>;
}
