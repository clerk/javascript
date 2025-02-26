import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';

export interface CommerceNamespace {
  billing: CommerceBillingNamespace;
  getPaymentSources: () => Promise<ClerkPaginatedResponse<CommercePaymentSourceResource>>;
  addPaymentSource: (params: AddPaymentSourceParams) => Promise<CommercePaymentSourceResource>;
}

export interface CommerceBillingNamespace {
  getProducts: (params?: GetProductsParams) => Promise<ClerkPaginatedResponse<CommerceProductResource>>;
  getPlans: (params?: GetPlansParams) => Promise<CommercePlanResource[]>;
  startCheckout: (params: CreateCheckoutParams) => Promise<CommerceCheckoutResource>;
  confirmCheckout: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  cancelSubscription: ({ subscriptionId }: { subscriptionId: string }) => Promise<any>;
}

export type GetProductsParams = ClerkPaginationParams<{
  subscriberType?: string;
}>;

export interface CommerceProductResource extends ClerkResource {
  id: string;
  slug: string | null;
  currency: string;
  isDefault: boolean;
  plans: CommercePlanResource[];
}

export interface GetPlansParams {
  productId?: string;
}

export interface CommercePlanResource extends ClerkResource {
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
  features: CommerceFeatureResource[];
}

export interface CommerceFeatureResource extends ClerkResource {
  id: string;
  name: string;
  description: string;
  slug: string;
  avatarUrl: string;
}

export interface AddPaymentSourceParams {
  gateway: 'stripe' | 'paypal';
  paymentMethod: string;
  paymentToken: string;
}

export interface CommercePaymentSourceResource extends ClerkResource {
  id: string;
  last4: string;
  paymentMethod: string;
  cardType: string;
}

export interface CommerceInvoiceResource extends ClerkResource {
  id: string;
  planId: string;
  paymentSourceId: string;
  totals: CommerceTotals;
  paymentDueOn: number;
  paidOn: number;
  status: string;
}

export interface CommerceSubscriptionResource extends ClerkResource {
  id: string;
  paymentSourceId: string;
  plan: CommercePlanResource;
  planPeriod: string;
  status: string;
}

export interface CommerceMoney {
  amount: number;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
}

export interface CommerceTotals {
  subtotal: CommerceMoney;
  grandTotal: CommerceMoney;
  taxTotal: CommerceMoney;
  totalDueNow?: CommerceMoney;
}

export interface CreateCheckoutParams {
  planId: string;
  planPeriod: string;
}

export interface ConfirmCheckoutParams {
  checkoutId: string;
  paymentSourceId?: string;
}

export interface CommerceCheckoutResource extends ClerkResource {
  id: string;
  externalClientSecret: string;
  externalGatewayId: string;
  invoice?: CommerceInvoiceResource;
  paymentSource?: CommercePaymentSourceResource;
  plan: CommercePlanResource;
  planPeriod: string;
  status: string;
  totals: CommerceTotals;
  subscription?: CommerceSubscriptionResource;
}
