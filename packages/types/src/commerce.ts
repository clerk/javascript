import type { DeletedObjectResource } from './deletedObject';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';
import type { CommerceFeatureJSONSnapshot } from './snapshots';

type WithOptionalOrgType<T> = T & {
  /**
   * The organization ID to perform the request on.
   */
  orgId?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommerceBillingNamespace {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPaymentAttempts: (params: GetPaymentAttemptsParams) => Promise<ClerkPaginatedResponse<CommercePaymentResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPaymentAttempt: (params: { id: string; orgId?: string }) => Promise<CommercePaymentResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPlans: (params?: GetPlansParams) => Promise<ClerkPaginatedResponse<CommercePlanResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPlan: (params: { id: string }) => Promise<CommercePlanResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getSubscription: (params: GetSubscriptionParams) => Promise<CommerceSubscriptionResource>;

  /**
   * @deprecated Use `getSubscription` to fetch a single subscription with its items
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getSubscriptions: (
    params: GetSubscriptionsParams,
  ) => Promise<ClerkPaginatedResponse<CommerceSubscriptionItemResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getStatements: (params: GetStatementsParams) => Promise<ClerkPaginatedResponse<CommerceStatementResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getStatement: (params: { id: string; orgId?: string }) => Promise<CommerceStatementResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  startCheckout: (params: CreateCheckoutParams) => Promise<CommerceCheckoutResource>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type CommercePayerResourceType = 'org' | 'user';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type ForPayerType = 'organization' | 'user';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type CommerceSubscriptionStatus = 'active' | 'ended' | 'upcoming' | 'past_due';

/**
 * The billing period for the plan.
 *
 * @inline
 */
export type CommerceSubscriptionPlanPeriod = 'month' | 'annual';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommercePaymentSourceMethods {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  initializePaymentSource: (
    params: Exclude<InitializePaymentSourceParams, 'orgId'>,
  ) => Promise<CommerceInitializedPaymentSourceResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  addPaymentSource: (params: Exclude<AddPaymentSourceParams, 'orgId'>) => Promise<CommercePaymentSourceResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPaymentSources: (
    params: Exclude<GetPaymentSourcesParams, 'orgId'>,
  ) => Promise<ClerkPaginatedResponse<CommercePaymentSourceResource>>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetPlansParams = ClerkPaginationParams<{
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  for?: ForPayerType;
}>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommercePlanResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  name: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  fee: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  annualFee: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  annualMonthlyFee: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  description: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  isDefault: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  isRecurring: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  hasBaseFee: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   *
   * Specifies the subscriber type this plan is designed for.
   *
   * Each plan is exclusively created for either individual users or organizations,
   * and cannot be used interchangeably.
   */
  forPayerType: CommercePayerResourceType;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  publiclyVisible: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  slug: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  avatarUrl: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  features: CommerceFeatureResource[];
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  freeTrialDays: number | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  freeTrialEnabled: boolean;
}

/**
 * The `CommerceFeatureResource` type represents a feature of a subscription plan.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version to avoid breaking changes.
 */
export interface CommerceFeatureResource extends ClerkResource {
  /**
   * The unique identifier for the feature.
   */
  id: string;
  /**
   * The display name of the feature.
   */
  name: string;
  /**
   * A short description of what the feature provides.
   */
  description: string;
  /**
   * A unique, URL-friendly identifier for the feature.
   */
  slug: string;
  /**
   * The URL of the feature's avatar image.
   */
  avatarUrl: string;
  /**
   * @hidden
   */
  __internal_toSnapshot: () => CommerceFeatureJSONSnapshot;
}

/**
 * The status of a payment source.
 * @inline
 */
export type CommercePaymentSourceStatus = 'active' | 'expired' | 'disconnected';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetPaymentSourcesParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type PaymentGateway = 'stripe' | 'paypal';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type InitializePaymentSourceParams = WithOptionalOrgType<{
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  gateway: PaymentGateway;
}>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type AddPaymentSourceParams = WithOptionalOrgType<{
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  gateway: PaymentGateway;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  paymentToken: string;
}>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type RemovePaymentSourceParams = WithOptionalOrgType<unknown>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type MakeDefaultPaymentSourceParams = WithOptionalOrgType<unknown>;

/**
 * The `CommercePaymentSourceResource` type represents a payment source for a checkout session.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommercePaymentSourceResource extends ClerkResource {
  /**
   * The unique identifier for the payment method.
   */
  id: string;
  /**
   * The last four digits of the payment method.
   */
  last4: string;
  /**
   * The type of payment method. For example, `'card'` or `'bank_account'`.
   */
  paymentMethod: string;
  /**
   * The brand or type of card. For example, `'visa'` or `'mastercard'`.
   */
  cardType: string;
  /**
   * Whether the payment method is set as the default for the account.
   */
  isDefault: boolean;
  /**
   * Whether the payment method can be removed by the user.
   */
  isRemovable: boolean;
  /**
   * The current status of the payment method.
   */
  status: CommercePaymentSourceStatus;
  /**
   * The type of digital wallet, if applicable. For example, `'apple_pay'`, or `'google_pay'`.
   */
  walletType: string | undefined;
  /**
   * A function that removes this payment source from the account. Accepts the following parameters:
   * - `orgId?` (`string`): The ID of the organization to remove the payment source from.
   * @param params - The parameters for the remove operation.
   * @returns A promise that resolves to a `DeletedObjectResource` object.
   */
  remove: (params?: RemovePaymentSourceParams) => Promise<DeletedObjectResource>;
  /**
   * A function that sets this payment source as the default for the account. Accepts the following parameters:
   * - `orgId?` (`string`): The ID of the organization to set as the default.
   * @param params - The parameters for the make default operation.
   * @returns A promise that resolves to `null`.
   */
  makeDefault: (params?: MakeDefaultPaymentSourceParams) => Promise<null>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommerceInitializedPaymentSourceResource extends ClerkResource {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  externalClientSecret: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  externalGatewayId: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  paymentMethodOrder: string[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type CommercePaymentChargeType = 'checkout' | 'recurring';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type CommercePaymentStatus = 'pending' | 'paid' | 'failed';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommercePaymentResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  amount: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  paidAt?: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  failedAt?: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  updatedAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  paymentSource: CommercePaymentSourceResource;
  /**
   * @deprecated Use `subscriptionItem` instead.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  subscription: CommerceSubscriptionItemResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  subscriptionItem: CommerceSubscriptionItemResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  chargeType: CommercePaymentChargeType;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  status: CommercePaymentStatus;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetPaymentAttemptsParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetStatementsParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */

export type CommerceStatementStatus = 'open' | 'closed';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommerceStatementResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  totals: CommerceStatementTotals;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  status: CommerceStatementStatus;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  timestamp: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  groups: CommerceStatementGroup[];
}

/**
 * The `CommerceStatementGroup` type represents a group of payment items within a statement.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommerceStatementGroup {
  /**
   * The date and time when this group of payment items was created or last updated.
   */
  timestamp: Date;
  /**
   * An array of payment resources that belong to this group.
   */
  items: CommercePaymentResource[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetSubscriptionsParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetSubscriptionParams = {
  orgId?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type CancelSubscriptionParams = WithOptionalOrgType<unknown>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */

export interface CommerceSubscriptionItemResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  //TODO(@COMMERCE): should this be nullable ?
  paymentSourceId: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  plan: CommercePlanResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  planPeriod: CommerceSubscriptionPlanPeriod;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  status: CommerceSubscriptionStatus;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  createdAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  pastDueAt: Date | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  periodStart: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  periodEnd: Date | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  canceledAt: Date | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  amount?: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  credit?: {
    /**
     * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
     * ```
     */
    amount: CommerceMoneyAmount;
  };
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  cancel: (params: CancelSubscriptionParams) => Promise<DeletedObjectResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   */
  isFreeTrial: boolean;
}

/**
 * The `CommerceSubscriptionResource` type represents a subscription to a plan.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 */
export interface CommerceSubscriptionResource extends ClerkResource {
  /**
   * The unique identifier for the subscription.
   */
  id: string;
  /**
   * The date when the subscription became active.
   */
  activeAt: Date;
  /**
   * The date when the subscription was created.
   */
  createdAt: Date;
  /**
   * Information about the next payment, including the amount and the date it's due. Returns null if there is no upcoming payment.
   */
  nextPayment: {
    /**
     * The amount of the next payment.
     */
    amount: CommerceMoneyAmount;
    /**
     * The date when the next payment is due.
     */
    date: Date;
  } | null;
  /**
   * The date when the subscription became past due, or `null` if the subscription is not past due.
   */
  pastDueAt: Date | null;

  /**
   * The current status of the subscription. Due to the free plan subscription item, the top level subscription can either be `active` or `past_due`.
   */
  status: Extract<CommerceSubscriptionStatus, 'active' | 'past_due'>;

  /**
   * The list of items (plans/features) included in this subscription.
   */
  subscriptionItems: CommerceSubscriptionItemResource[];

  /**
   * The date when the subscription was last updated, or `null` if it hasn't been updated.
   */
  updatedAt: Date | null;

  /**
   * Whether the payer is eligible for a free trial.
   */
  eligibleForFreeTrial?: boolean;
}

/**
 * The `CommerceMoneyAmount` type represents a monetary value with currency information.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommerceMoneyAmount {
  /**
   * The raw amount as a number, usually in the smallest unit of the currency (like cents for USD). For example, `1000` for $10.00.
   */
  amount: number;
  /**
   * The amount as a formatted string. For example, `10.00` for $10.00.
   */
  amountFormatted: string;
  /**
   * The ISO currency code for this amount. For example, `USD`.
   */
  currency: string;
  /**
   * The symbol for the currency. For example, `$`.
   */
  currencySymbol: string;
}

/**
 * The `CommerceCheckoutTotals` type represents the total costs, taxes, and other pricing details for a checkout session.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommerceCheckoutTotals {
  /**
   * The price of the items or plan before taxes, credits, or discounts are applied.
   */
  subtotal: CommerceMoneyAmount;
  /**
   * The total amount for the checkout, including taxes and after credits/discounts are applied. This is the final amount due.
   */
  grandTotal: CommerceMoneyAmount;
  /**
   * The amount of tax included in the checkout.
   */
  taxTotal: CommerceMoneyAmount;
  /**
   * The amount that needs to be immediately paid to complete the checkout.
   */
  totalDueNow: CommerceMoneyAmount;
  /**
   * Any credits (like account balance or promo credits) that are being applied to the checkout.
   */
  credit: CommerceMoneyAmount;
  /**
   * Any outstanding amount from previous unpaid invoices that is being collected as part of the checkout.
   */
  pastDue: CommerceMoneyAmount;
}

/**
 * The `CommerceStatementTotals` type represents the total costs, taxes, and other pricing details for a statement.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommerceStatementTotals extends Omit<CommerceCheckoutTotals, 'totalDueNow'> {}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type CreateCheckoutParams = WithOptionalOrgType<{
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  planId: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  planPeriod: CommerceSubscriptionPlanPeriod;
}>;

/**
 * The `confirm()` method accepts the following parameters. **Only one of `paymentSourceId`, `paymentToken`, or `useTestCard` should be provided.**
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type ConfirmCheckoutParams =
  | {
      /**
       * The ID of a saved payment source to use for this checkout.
       */
      paymentSourceId?: string;
    }
  | {
      /**
       * A token representing payment details, usually from a payment form. **Requires** `gateway` to be provided.
       */
      paymentToken?: string;
      /**
       * The payment gateway to use. For example, `'stripe'` or `'paypal'`. **Required** if `paymentToken` or `useTestCard` is provided.
       */
      gateway?: PaymentGateway;
    }
  | {
      /**
       * The payment gateway to use. For example, `'stripe'` or `'paypal'`. **Required** if `paymentToken` or `useTestCard` is provided.
       */
      gateway?: PaymentGateway;
      /**
       * If true, uses a test card for the checkout. **Requires** `gateway` to be provided.
       */
      useTestCard?: boolean;
    };

/**
 * The `CommerceCheckoutResource` type represents information about a checkout session.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommerceCheckoutResource extends ClerkResource {
  /**
   * The unique identifier for the checkout session.
   */
  id: string;
  /**
   * A client secret from an external payment provider (such as Stripe) used to complete the payment on the client-side.
   */
  externalClientSecret: string;
  /**
   * The identifier for the external payment gateway used for this checkout session.
   */
  externalGatewayId: string;
  /**
   * The payment source being used for the checkout, such as a credit card or bank account.
   */
  paymentSource?: CommercePaymentSourceResource;
  /**
   * The subscription plan details for the checkout.
   */
  plan: CommercePlanResource;
  /**
   * The billing period for the plan.
   */
  planPeriod: CommerceSubscriptionPlanPeriod;
  /**
   * Unix timestamp (milliseconds) of when the current period starts.
   */
  planPeriodStart?: number;
  /**
   * The current status of the checkout session.
   */
  status: 'needs_confirmation' | 'completed';
  /**
   * The total costs, taxes, and other pricing details for the checkout.
   */
  totals: CommerceCheckoutTotals;
  /**
   * A function to confirm and finalize the checkout process, usually after payment information has been provided and validated. [Learn more.](#confirm)
   */
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  /**
   * Whether the plan change will take effect immediately after checkout.
   */
  isImmediatePlanChange: boolean;
  /**
   * Unix timestamp (milliseconds) of when the free trial ends.
   */
  freeTrialEndsAt: Date | null;
  /**
   * The payer associated with the checkout.
   */
  payer: CommercePayerResource;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface CommercePayerResource extends ClerkResource {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  createdAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  updatedAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  imageUrl: string | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  userId?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  email?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  firstName?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  lastName?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  organizationId?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://docs.renovatebot.com/dependency-pinning/#what-is-dependency-pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  organizationName?: string;
}
