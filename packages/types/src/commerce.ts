import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';

export interface CommerceNamespace {
  billing: CommerceBillingNamespace;
  addPaymentSource: (params: AddPaymentSourceParams) => Promise<any>;
}

export interface CommerceBillingNamespace {
  getProducts: (params?: GetProductsParams) => Promise<ClerkPaginatedResponse<CommerceProductResource>>;
  getPlans: (params?: GetPlansParams) => Promise<CommercePlanResource[]>;
  startCheckout: (params: CreateCheckoutParams) => Promise<CommerceCheckoutResource>;
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
  totals: CommerceCheckoutTotals;
  paymentDueOn: number;
  paidOn: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface CommerceSubscriptionResource extends ClerkResource {
  id: string;
  instanceId: string;
  paymentSourceId: string;
  status: string;
  planId: string;
  plan: CommercePlanResource;
  createdAt: number;
  updatedAt: number;
}

interface CommerceMoney {
  amount: number;
  formattedAmount: string;
  currency: string;
  currencySymbol: string;
}

interface CommerceCheckoutTotals {
  subtotal: CommerceMoney;
  grandTotal: CommerceMoney;
  taxTotal: CommerceMoney;
  totalDueNow: CommerceMoney;
}

export interface CreateCheckoutParams {
  planId: string;
  planPeriod: string;
}

export interface CommerceCheckoutResource extends ClerkResource {
  id: string;
  plan: CommercePlanResource;
  paymentSource: CommercePaymentSourceResource;
  status: string;
  totals: CommerceCheckoutTotals;
  subscription: CommerceSubscriptionResource;
  invoice: CommerceInvoiceResource;
}
