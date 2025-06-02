import type { DeletedObjectResource } from './deletedObject';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';
import type { CommerceFeatureJSONSnapshot, CommercePlanJSONSnapshot } from './snapshots';

type WithOptionalOrgType<T> = T & {
  orgId?: string;
};

export interface CommerceBillingNamespace {
  getPlans: (params?: GetPlansParams) => Promise<CommercePlanResource[]>;
  getSubscriptions: (params: GetSubscriptionsParams) => Promise<ClerkPaginatedResponse<CommerceSubscriptionResource>>;
  getStatements: (params: GetStatementsParams) => Promise<ClerkPaginatedResponse<CommerceStatementResource>>;
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
  annualAmount: number;
  annualAmountFormatted: string;
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
  __internal_toSnapshot: () => CommercePlanJSONSnapshot;
}

export interface CommerceFeatureResource extends ClerkResource {
  id: string;
  name: string;
  description: string;
  slug: string;
  avatarUrl: string;
  __internal_toSnapshot: () => CommerceFeatureJSONSnapshot;
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
  isRemovable: boolean;
  status: CommercePaymentSourceStatus;
  walletType: string | undefined;
  remove: (params?: RemovePaymentSourceParams) => Promise<DeletedObjectResource>;
  makeDefault: (params?: MakeDefaultPaymentSourceParams) => Promise<null>;
}

export interface CommerceInitializedPaymentSourceResource extends ClerkResource {
  externalClientSecret: string;
  externalGatewayId: string;
}

export type GetStatementsParams = WithOptionalOrgType<ClerkPaginationParams>;

export type CommerceStatementStatus = 'open' | 'closed';

export interface CommerceStatementResource extends ClerkResource {
  id: string;
  totals: CommerceStatementTotals;
  status: CommerceStatementStatus;
  timestamp: number;
  groups: CommerceStatementGroup[];
}

export interface CommerceStatementGroup {
  timestamp: number;
  items: CommercePayment[];
}

export type CommercePaymentChargeType = 'checkout' | 'recurring';
export type CommercePaymentStatus = 'pending' | 'paid' | 'failed';

export interface CommercePayment {
  id: string;
  amount: CommerceMoney;
  paymentSource: CommercePaymentSourceResource;
  subscription: CommerceSubscriptionResource;
  chargeType: CommercePaymentChargeType;
  status: CommercePaymentStatus;
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
  amount?: CommerceMoney;
  credit?: {
    amount: CommerceMoney;
  };
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
  credit: CommerceMoney;
  pastDue: CommerceMoney;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommerceStatementTotals extends Omit<CommerceCheckoutTotals, 'totalDueNow'> {}

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
  statement_id: string;
  paymentSource?: CommercePaymentSourceResource;
  plan: CommercePlanResource;
  planPeriod: CommerceSubscriptionPlanPeriod;
  planPeriodStart?: number;
  status: string;
  totals: CommerceCheckoutTotals;
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  isImmediatePlanChange: boolean;
}
