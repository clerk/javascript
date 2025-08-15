import type { DeletedObjectResource } from './deletedObject';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';
import type { CommerceFeatureJSONSnapshot } from './snapshots';

type WithOptionalOrgType<T> = T & {
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
export interface CommerceBillingNamespace {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPaymentAttempts: (params: GetPaymentAttemptsParams) => Promise<ClerkPaginatedResponse<CommercePaymentResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPaymentAttempt: (params: { id: string; orgId?: string }) => Promise<CommercePaymentResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPlans: (params?: GetPlansParams) => Promise<ClerkPaginatedResponse<CommercePlanResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getPlan: (params: { id: string }) => Promise<CommercePlanResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getSubscription: (params: GetSubscriptionParams) => Promise<CommerceSubscriptionResource>;

  /**
   * @deprecated Use `getSubscription` to fetch a single subscription with its items
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getSubscriptions: (
    params: GetSubscriptionsParams,
  ) => Promise<ClerkPaginatedResponse<CommerceSubscriptionItemResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getStatements: (params: GetStatementsParams) => Promise<ClerkPaginatedResponse<CommerceStatementResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  getStatement: (params: { id: string; orgId?: string }) => Promise<CommerceStatementResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  startCheckout: (params: CreateCheckoutParams) => Promise<CommerceCheckoutResource>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type CommercePayerResourceType = 'org' | 'user';

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
export type CommerceSubscriptionStatus = 'active' | 'ended' | 'upcoming' | 'past_due';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type CommerceSubscriptionPlanPeriod = 'month' | 'annual';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommercePaymentSourceMethods {
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
  ) => Promise<CommerceInitializedPaymentSourceResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  addPaymentSource: (params: Exclude<AddPaymentSourceParams, 'orgId'>) => Promise<CommercePaymentSourceResource>;
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
  ) => Promise<ClerkPaginatedResponse<CommercePaymentSourceResource>>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceProductResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  slug: string | null;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  currency: string;
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
  plans: CommercePlanResource[];
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
export interface CommercePlanResource extends ClerkResource {
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
  fee: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  annualFee: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  annualMonthlyFee: CommerceMoneyAmount;
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
  forPayerType: CommercePayerResourceType;
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
  features: CommerceFeatureResource[];
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
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceFeatureResource extends ClerkResource {
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
  description: string;
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
  __internal_toSnapshot: () => CommerceFeatureJSONSnapshot;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type CommercePaymentSourceStatus = 'active' | 'expired' | 'disconnected';

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
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommercePaymentSourceResource extends ClerkResource {
  id: string;
  last4: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  paymentMethod: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  cardType: string;
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
  isRemovable: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  status: CommercePaymentSourceStatus;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  walletType: string | undefined;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  remove: (params?: RemovePaymentSourceParams) => Promise<DeletedObjectResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
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
export interface CommerceInitializedPaymentSourceResource extends ClerkResource {
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
export type CommercePaymentChargeType = 'checkout' | 'recurring';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type CommercePaymentStatus = 'pending' | 'paid' | 'failed';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommercePaymentResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  amount: CommerceMoneyAmount;
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
  paymentSource: CommercePaymentSourceResource;
  /**
   * @deprecated Use `subscriptionItem` instead.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  subscription: CommerceSubscriptionItemResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  subscriptionItem: CommerceSubscriptionItemResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  chargeType: CommercePaymentChargeType;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  status: CommercePaymentStatus;
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

export type CommerceStatementStatus = 'open' | 'closed';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceStatementResource extends ClerkResource {
  id: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  totals: CommerceStatementTotals;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  status: CommerceStatementStatus;
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
  groups: CommerceStatementGroup[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceStatementGroup {
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
  items: CommercePaymentResource[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type GetSubscriptionsParams = WithOptionalOrgType<ClerkPaginationParams>;

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
export interface CommerceSubscriptionItemResource extends ClerkResource {
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
  plan: CommercePlanResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  planPeriod: CommerceSubscriptionPlanPeriod;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  status: CommerceSubscriptionStatus;
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
  amount?: CommerceMoneyAmount;
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
    amount: CommerceMoneyAmount;
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
export interface CommerceSubscriptionResource extends ClerkResource {
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
    amount: CommerceMoneyAmount;
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
  status: Extract<CommerceSubscriptionStatus, 'active' | 'past_due'>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  subscriptionItems: CommerceSubscriptionItemResource[];

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
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceMoneyAmount {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  amount: number;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  amountFormatted: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  currency: string;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  currencySymbol: string;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceCheckoutTotals {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  subtotal: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  grandTotal: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  taxTotal: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  totalDueNow: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  credit: CommerceMoneyAmount;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  pastDue: CommerceMoneyAmount;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommerceStatementTotals extends Omit<CommerceCheckoutTotals, 'totalDueNow'> {}

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
  planPeriod: CommerceSubscriptionPlanPeriod;
}>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type ConfirmCheckoutParams = WithOptionalOrgType<
  | {
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
       * @example
       * ```tsx
       * <ClerkProvider clerkJsVersion="x.x.x" />
       * ```
       */
      paymentSourceId?: string;
    }
  | {
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
       * @example
       * ```tsx
       * <ClerkProvider clerkJsVersion="x.x.x" />
       * ```
       */
      paymentToken?: string;
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
       * @example
       * ```tsx
       * <ClerkProvider clerkJsVersion="x.x.x" />
       * ```
       */
      gateway?: PaymentGateway;
    }
  | {
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
       * @example
       * ```tsx
       * <ClerkProvider clerkJsVersion="x.x.x" />
       * ```
       */
      gateway?: PaymentGateway;
      /**
       * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
       * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
       * @example
       * ```tsx
       * <ClerkProvider clerkJsVersion="x.x.x" />
       * ```
       */
      useTestCard?: boolean;
    }
>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceCheckoutResource extends ClerkResource {
  id: string;
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
  paymentSource?: CommercePaymentSourceResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  plan: CommercePlanResource;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  planPeriod: CommerceSubscriptionPlanPeriod;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  planPeriodStart?: number;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  status: 'needs_confirmation' | 'completed';
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  totals: CommerceCheckoutTotals;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  isImmediatePlanChange: boolean;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  freeTrialEndsAt: Date | null;
}
