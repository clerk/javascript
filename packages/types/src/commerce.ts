import type { DeletedObjectResource } from './deletedObject';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';

type WithOptionalOrgType<T> = T & {
  /**
   * The organization ID to perform the request on.
   */
  orgId?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingNamespace {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPaymentAttempts: (params: GetPaymentAttemptsParams) => Promise<ClerkPaginatedResponse<BillingPaymentResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPaymentAttempt: (params: { id: string; orgId?: string }) => Promise<BillingPaymentResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPlans: (params?: GetPlansParams) => Promise<ClerkPaginatedResponse<BillingPlanResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPlan: (params: { id: string }) => Promise<BillingPlanResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getSubscription: (params: GetSubscriptionParams) => Promise<BillingSubscriptionResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getStatements: (params: GetStatementsParams) => Promise<ClerkPaginatedResponse<BillingStatementResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getStatement: (params: { id: string; orgId?: string }) => Promise<BillingStatementResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  startCheckout: (params: CreateCheckoutParams) => Promise<BillingCheckoutResource>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type BillingPayerResourceType = 'org' | 'user';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type ForPayerType = 'organization' | 'user';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type BillingSubscriptionStatus = 'active' | 'ended' | 'upcoming' | 'past_due';

/**
 * The billing period for the plan.
 *
 * @inline
 */
export type BillingSubscriptionPlanPeriod = 'month' | 'annual';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingPaymentSourceMethods {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  initializePaymentSource: (
    params: Exclude<InitializePaymentSourceParams, 'orgId'>,
  ) => Promise<BillingInitializedPaymentSourceResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  addPaymentSource: (params: Exclude<AddPaymentSourceParams, 'orgId'>) => Promise<BillingPaymentSourceResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPaymentSources: (
    params: Exclude<GetPaymentSourcesParams, 'orgId'>,
  ) => Promise<ClerkPaginatedResponse<BillingPaymentSourceResource>>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type GetPlansParams = ClerkPaginationParams<{
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  for?: ForPayerType;
}>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingPlanResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  name: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  fee: BillingMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  annualFee: BillingMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  annualMonthlyFee: BillingMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  description: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  isDefault: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  isRecurring: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  hasBaseFee: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   *
   * Specifies the subscriber type this plan is designed for.
   *
   * Each plan is exclusively created for either individual users or organizations,
   * and cannot be used interchangeably.
   */
  forPayerType: BillingPayerResourceType;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  publiclyVisible: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  slug: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  avatarUrl: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  features: FeatureResource[];
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  freeTrialDays: number | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  freeTrialEnabled: boolean;
}

/**
 * The `FeatureResource` type represents a feature of a plan.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version to avoid breaking changes.
 */
export interface FeatureResource extends ClerkResource {
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
}

/**
 * The status of a payment source.
 * @inline
 */
export type BillingPaymentSourceStatus = 'active' | 'expired' | 'disconnected';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type GetPaymentSourcesParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type PaymentGateway = 'stripe' | 'paypal';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type InitializePaymentSourceParams = WithOptionalOrgType<{
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  gateway: PaymentGateway;
}>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type AddPaymentSourceParams = WithOptionalOrgType<{
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  gateway: PaymentGateway;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  paymentToken: string;
}>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type RemovePaymentSourceParams = WithOptionalOrgType<unknown>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type MakeDefaultPaymentSourceParams = WithOptionalOrgType<unknown>;

/**
 * The `BillingPaymentSourceResource` type represents a payment source for a checkout session.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingPaymentSourceResource extends ClerkResource {
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
  status: BillingPaymentSourceStatus;
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
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingInitializedPaymentSourceResource extends ClerkResource {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  externalClientSecret: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  externalGatewayId: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  paymentMethodOrder: string[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type BillingPaymentChargeType = 'checkout' | 'recurring';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type BillingPaymentStatus = 'pending' | 'paid' | 'failed';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingPaymentResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  amount: BillingMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  paidAt?: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  failedAt?: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  updatedAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  paymentSource: BillingPaymentSourceResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  subscriptionItem: BillingSubscriptionItemResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  chargeType: BillingPaymentChargeType;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  status: BillingPaymentStatus;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type GetPaymentAttemptsParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type GetStatementsParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */

export type BillingStatementStatus = 'open' | 'closed';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingStatementResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  totals: BillingStatementTotals;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  status: BillingStatementStatus;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  timestamp: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  groups: BillingStatementGroup[];
}

/**
 * The `BillingStatementGroup` type represents a group of payment items within a statement.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingStatementGroup {
  /**
   * The date and time when this group of payment items was created or last updated.
   */
  timestamp: Date;
  /**
   * An array of payment resources that belong to this group.
   */
  items: BillingPaymentResource[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type GetSubscriptionParams = {
  orgId?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type CancelSubscriptionParams = WithOptionalOrgType<unknown>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingSubscriptionItemResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  //TODO(@COMMERCE): should this be nullable ?
  paymentSourceId: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  plan: BillingPlanResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  planPeriod: BillingSubscriptionPlanPeriod;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  status: BillingSubscriptionStatus;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  createdAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  pastDueAt: Date | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  periodStart: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  periodEnd: Date | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  canceledAt: Date | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  amount?: BillingMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  credit?: {
    /**
     * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
     * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
     * @example
     * ```tsx
     * <ClerkProvider clerkJsVersion="x.x.x" />
     * ```
     */
    amount: BillingMoneyAmount;
  };
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  cancel: (params: CancelSubscriptionParams) => Promise<DeletedObjectResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  isFreeTrial: boolean;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingSubscriptionResource extends ClerkResource {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  activeAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  createdAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  nextPayment: {
    /**
     * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
     * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
     * @example
     * ```tsx
     * <ClerkProvider clerkJsVersion="x.x.x" />
     * ```
     */
    amount: BillingMoneyAmount;
    /**
     * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
     * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
     * @example
     * ```tsx
     * <ClerkProvider clerkJsVersion="x.x.x" />
     * ```
     */
    date: Date;
  } | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   *
   * When at least one subscription item is past due, this property will get populated.
   */
  pastDueAt: Date | null;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   *
   * Due to the free plan subscription item, the top level subscription can either be `active` or `past_due`.
   */
  status: Extract<BillingSubscriptionStatus, 'active' | 'past_due'>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  subscriptionItems: BillingSubscriptionItemResource[];

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  updatedAt: Date | null;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  eligibleForFreeTrial?: boolean;
}

/**
 * The `BillingMoneyAmount` type represents a monetary value with currency information.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingMoneyAmount {
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
 * The `BillingCheckoutTotals` type represents the total costs, taxes, and other pricing details for a checkout session.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingCheckoutTotals {
  /**
   * The price of the items or plan before taxes, credits, or discounts are applied.
   */
  subtotal: BillingMoneyAmount;
  /**
   * The total amount for the checkout, including taxes and after credits/discounts are applied. This is the final amount due.
   */
  grandTotal: BillingMoneyAmount;
  /**
   * The amount of tax included in the checkout.
   */
  taxTotal: BillingMoneyAmount;
  /**
   * The amount that needs to be immediately paid to complete the checkout.
   */
  totalDueNow: BillingMoneyAmount;
  /**
   * Any credits (like account balance or promo credits) that are being applied to the checkout.
   */
  credit: BillingMoneyAmount;
  /**
   * Any outstanding amount from previous unpaid invoices that is being collected as part of the checkout.
   */
  pastDue: BillingMoneyAmount;
}

/**
 * The `BillingStatementTotals` type represents the total costs, taxes, and other pricing details for a statement.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to avoid breaking changes.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BillingStatementTotals extends Omit<BillingCheckoutTotals, 'totalDueNow'> {}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type CreateCheckoutParams = WithOptionalOrgType<{
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  planId: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  planPeriod: BillingSubscriptionPlanPeriod;
}>;

/**
 * The `confirm()` method accepts the following parameters. **Only one of `paymentSourceId`, `paymentToken`, or `useTestCard` should be provided.**
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to avoid breaking changes.
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
 * The `BillingCheckoutResource` type represents information about a checkout session.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to pin the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingCheckoutResource extends ClerkResource {
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
  paymentSource?: BillingPaymentSourceResource;
  /**
   * The subscription plan details for the checkout.
   */
  plan: BillingPlanResource;
  /**
   * The billing period for the plan.
   */
  planPeriod: BillingSubscriptionPlanPeriod;
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
  totals: BillingCheckoutTotals;
  /**
   * A function to confirm and finalize the checkout process, usually after payment information has been provided and validated. [Learn more.](#confirm)
   */
  confirm: (params: ConfirmCheckoutParams) => Promise<BillingCheckoutResource>;
  /**
   * Whether the plan change will take effect immediately after checkout.
   */
  isImmediatePlanChange: boolean;
  /**
   * Unix timestamp (milliseconds) of when the free trial ends.
   */
  freeTrialEndsAt: Date | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  payer: BillingPayerResource;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface BillingPayerResource extends ClerkResource {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  createdAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  updatedAt: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  imageUrl: string | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  userId?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  email?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  firstName?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  lastName?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  organizationId?: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  organizationName?: string;
}
