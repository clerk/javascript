import type { DeletedObjectResource } from './deletedObject';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';

type WithOptionalOrgType<T> = T & {
  orgId?: string;
};

export interface CommerceBillingNamespace {
  getPlans: () => Promise<CommercePlanResource[]>;
  getSubscriptions: (params: GetSubscriptionsParams) => Promise<ClerkPaginatedResponse<CommerceSubscriptionResource>>;
  getInvoices: (params: GetInvoicesParams) => Promise<ClerkPaginatedResponse<CommerceInvoiceResource>>;
  startCheckout: (params: CreateCheckoutParams) => Promise<CommerceCheckoutResource>;
}

export type CommerceSubscriberType = 'org' | 'user';
export type CommerceSubscriptionStatus = 'active' | 'ended' | 'upcoming';
export type CommerceSubscriptionPlanPeriod = 'month' | 'annual';

export interface CommercePaymentSourceMethods {
  initializePaymentSource: (
    params: Exclude<InitializePaymentSourceParams, 'orgId'>,
  ) => Promise<CommerceInitializedPaymentSourceResource>;
  addPaymentSource: (params: Exclude<AddPaymentSourceParams, 'orgId'>) => Promise<CommercePaymentSourceResource>;
  getPaymentSources: (
    params: Exclude<GetPaymentSourcesParams, 'orgId'>,
  ) => Promise<ClerkPaginatedResponse<CommercePaymentSourceResource>>;
}

export interface CommerceProductResource extends ClerkResource {
  id: string;
  slug: string | null;
  currency: string;
  isDefault: boolean;
  plans: CommercePlanResource[];
}

export interface GetPlansParams {
  subscriberType?: CommerceSubscriberType;
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
  isDefault: boolean;
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

export type CommercePaymentSourceStatus = 'active' | 'expired' | 'disconnected';

export type GetPaymentSourcesParams = WithOptionalOrgType<ClerkPaginationParams>;

export type PaymentGateway = 'stripe' | 'paypal';

export type InitializePaymentSourceParams = WithOptionalOrgType<{
  gateway: PaymentGateway;
}>;

export type AddPaymentSourceParams = WithOptionalOrgType<{
  gateway: PaymentGateway;
  paymentToken: string;
}>;

export type RemovePaymentSourceParams = WithOptionalOrgType<unknown>;
export type MakeDefaultPaymentSourceParams = WithOptionalOrgType<unknown>;

export interface CommercePaymentSourceResource extends ClerkResource {
  id: string;
  last4: string;
  paymentMethod: string;
  cardType: string;
  isDefault: boolean;
  status: CommercePaymentSourceStatus;
  walletType: string | undefined;
  remove: (params?: RemovePaymentSourceParams) => Promise<DeletedObjectResource>;
  makeDefault: (params?: MakeDefaultPaymentSourceParams) => Promise<null>;
}

export interface CommerceInitializedPaymentSourceResource extends ClerkResource {
  externalClientSecret: string;
  externalGatewayId: string;
}

export type GetInvoicesParams = WithOptionalOrgType<ClerkPaginationParams>;

export type CommerceInvoiceStatus = 'paid' | 'unpaid' | 'past_due';

export interface CommerceInvoiceResource extends ClerkResource {
  id: string;
  totals: CommerceInvoiceTotals;
  paymentDueOn: number;
  paidOn: number;
  status: CommerceInvoiceStatus;
}

export type GetSubscriptionsParams = WithOptionalOrgType<ClerkPaginationParams>;
export type CancelSubscriptionParams = WithOptionalOrgType<unknown>;

export interface CommerceSubscriptionResource extends ClerkResource {
  id: string;
  paymentSourceId: string;
  plan: CommercePlanResource;
  planPeriod: CommerceSubscriptionPlanPeriod;
  status: CommerceSubscriptionStatus;
  periodStart: number;
  periodEnd: number;
  canceledAt: number | null;
  cancel: (params: CancelSubscriptionParams) => Promise<DeletedObjectResource>;
}

export interface CommerceMoney {
  amount: number;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
}

export interface CommerceCheckoutTotals {
  subtotal: CommerceMoney;
  grandTotal: CommerceMoney;
  taxTotal: CommerceMoney;
  totalDueNow: CommerceMoney;
  proration?: {
    credit: CommerceMoney;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommerceInvoiceTotals extends Omit<CommerceCheckoutTotals, 'totalDueNow'> {}

export type CreateCheckoutParams = WithOptionalOrgType<{
  planId: string;
  planPeriod: CommerceSubscriptionPlanPeriod;
}>;

export type ConfirmCheckoutParams = WithOptionalOrgType<
  | {
      paymentSourceId?: string;
    }
  | {
      paymentToken?: string;
      gateway?: PaymentGateway;
    }
  | {
      gateway?: PaymentGateway;
      useTestCard?: boolean;
    }
>;
export interface CommerceCheckoutResource extends ClerkResource {
  id: string;
  externalClientSecret: string;
  externalGatewayId: string;
  invoice_id: string;
  paymentSource?: CommercePaymentSourceResource;
  plan: CommercePlanResource;
  planPeriod: CommerceSubscriptionPlanPeriod;
  status: string;
  totals: CommerceCheckoutTotals;
  subscription?: CommerceSubscriptionResource;
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  isImmediatePlanChange: boolean;
}
