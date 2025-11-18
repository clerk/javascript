import type { SetActiveNavigate } from './clerk';
import type { DeletedObjectResource } from './deletedObject';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';
import type { ForceNull, RemoveFunctions, Simplify } from './utils';

type WithOptionalOrgType<T> = T & {
  /**
   * The organization ID to perform the request on.
   */
  orgId?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingNamespace {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPaymentAttempts: (params: GetPaymentAttemptsParams) => Promise<ClerkPaginatedResponse<BillingPaymentResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPaymentAttempt: (params: { id: string; orgId?: string }) => Promise<BillingPaymentResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPlans: (params?: GetPlansParams) => Promise<ClerkPaginatedResponse<BillingPlanResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPlan: (params: { id: string }) => Promise<BillingPlanResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getSubscription: (params: GetSubscriptionParams) => Promise<BillingSubscriptionResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getStatements: (params: GetStatementsParams) => Promise<ClerkPaginatedResponse<BillingStatementResource>>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getStatement: (params: { id: string; orgId?: string }) => Promise<BillingStatementResource>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  startCheckout: (params: CreateCheckoutParams) => Promise<BillingCheckoutResource>;
}

/**
 * @inline
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type BillingPayerResourceType = 'org' | 'user';

/**
 * @inline
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type ForPayerType = 'organization' | 'user';

/**
 * @inline
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type BillingSubscriptionStatus = 'active' | 'ended' | 'upcoming' | 'past_due';

/**
 * The billing period for the plan.
 *
 * @inline
 */
export type BillingSubscriptionPlanPeriod = 'month' | 'annual';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingPayerMethods {
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  initializePaymentMethod: (params: InitializePaymentMethodParams) => Promise<BillingInitializedPaymentMethodResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  addPaymentMethod: (params: AddPaymentMethodParams) => Promise<BillingPaymentMethodResource>;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  getPaymentMethods: (
    params?: GetPaymentMethodsParams,
  ) => Promise<ClerkPaginatedResponse<BillingPaymentMethodResource>>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetPlansParams = ClerkPaginationParams<{
  /**
   * The type of payer for the plans.
   */
  for?: ForPayerType;
}>;

/**
 * The `BillingPlanResource` type represents a subscription plan with its details.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingPlanResource extends ClerkResource {
  /**
   * The unique identifier for the plan.
   */
  id: string;
  /**
   * The name of the plan.
   */
  name: string;
  /**
   * The monthly price of the plan.
   */
  fee: BillingMoneyAmount;
  /**
   * The annual price of the plan or `null` if the plan is not annual.
   */
  annualFee: BillingMoneyAmount | null;
  /**
   * The effective monthly price when billed annually or `null` if the plan is not annual.
   */
  annualMonthlyFee: BillingMoneyAmount | null;
  /**
   * A short description of what the plan offers, or `null` if no description is provided.
   */
  description: string | null;
  /**
   * Whether the plan is the default plan.
   */
  isDefault: boolean;
  /**
   * Whether the plan is recurring.
   */
  isRecurring: boolean;
  /**
   * Whether the plan has a base fee.
   */
  hasBaseFee: boolean;
  /**
   * Specifies the subscriber type this plan is designed for.
   *
   * Each plan is exclusively created for either individual users or organizations, and cannot be used interchangeably.
   */
  forPayerType: BillingPayerResourceType;
  /**
   * Whether the plan is visible to the public.
   */
  publiclyVisible: boolean;
  /**
   * The URL-friendly identifier of the plan.
   */
  slug: string;
  /**
   * The URL of the plan's avatar image, or `null` if not set.
   */
  avatarUrl: string | null;
  /**
   * The features the plan offers.
   */
  features: FeatureResource[];
  /**
   * The number of days of the free trial for the plan. `null` if the plan does not have a free trial.
   */
  freeTrialDays: number | null;
  /**
   * Whether the plan has a free trial.
   */
  freeTrialEnabled: boolean;
}

/**
 * The `FeatureResource` type represents a feature of a plan.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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
   * A short description of what the feature provides, or `null` if not provided.
   */
  description: string | null;
  /**
   * A unique, URL-friendly identifier for the feature.
   */
  slug: string;
  /**
   * The URL of the feature's avatar image, or `null` if not set.
   */
  avatarUrl: string | null;
}

/**
 * The status of a payment method.
 *
 * @inline
 */
export type BillingPaymentMethodStatus = 'active' | 'expired' | 'disconnected';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetPaymentMethodsParams = ClerkPaginationParams;

/**
 * @inline
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type PaymentGateway = 'stripe';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type InitializePaymentMethodParams = {
  /**
   * The payment gateway to use.
   */
  gateway: PaymentGateway;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type AddPaymentMethodParams = {
  /**
   * The payment gateway to use.
   */
  gateway: PaymentGateway;
  /**
   * A token representing payment details, usually from a payment form.
   */
  paymentToken: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type RemovePaymentMethodParams = WithOptionalOrgType<unknown>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type MakeDefaultPaymentMethodParams = WithOptionalOrgType<unknown>;

/**
 * The `BillingPaymentMethodResource` type represents a payment method for a checkout session.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingPaymentMethodResource extends ClerkResource {
  /**
   * The unique identifier for the payment method.
   */
  id: string;
  /**
   * The last four digits of the payment method.
   */
  last4: string | null;
  /**
   * The type of payment method. For example, `'card'`.
   */
  paymentType?: 'card';
  /**
   * The brand or type of card. For example, `'visa'` or `'mastercard'`.
   */
  cardType: string | null;
  /**
   * Whether the payment method is set as the default for the account.
   */
  isDefault?: boolean;
  /**
   * Whether the payment method can be removed by the user.
   */
  isRemovable?: boolean;
  /**
   * The current status of the payment method.
   */
  status: BillingPaymentMethodStatus;
  /**
   * The type of digital wallet, if applicable. For example, `'apple_pay'`, or `'google_pay'`.
   */
  walletType?: string | null;
  /**
   * The card expiration year, if available.
   */
  expiryYear?: number | null;
  /**
   * The card expiration month, if available.
   */
  expiryMonth?: number | null;
  /**
   * The date the payment method was created, if available.
   */
  createdAt?: Date | null;
  /**
   * The date the payment method was last updated, if available.
   */
  updatedAt?: Date | null;
  /**
   * A function that removes this payment method from the account. Accepts the following parameters:
   * <ul>
   *  <li>`orgId?` (`string`): The ID of the organization to remove the payment method from.</li>
   * </ul>
   *
   * @param params - The parameters for the remove operation.
   * @returns A promise that resolves to a `DeletedObjectResource` object.
   */
  remove: (params?: RemovePaymentMethodParams) => Promise<DeletedObjectResource>;
  /**
   * A function that sets this payment method as the default for the account. Accepts the following parameters:
   * <ul>
   *  <li>`orgId?` (`string`): The ID of the organization to set as the default.</li>
   * </ul>
   *
   * @param params - The parameters for the make default operation.
   * @returns A promise that resolves to `null`.
   */
  makeDefault: (params?: MakeDefaultPaymentMethodParams) => Promise<null>;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingInitializedPaymentMethodResource extends ClerkResource {
  /**
   * A client secret from an external payment provider (such as Stripe) used to complete the payment on the client-side.
   */
  externalClientSecret: string;
  /**
   * The identifier for the external payment gateway used for this checkout session.
   */
  externalGatewayId: string;
  /**
   * The order the payment methods will be displayed in when `<PaymentElement/>` renders.
   */
  paymentMethodOrder: string[];
}

/**
 * @inline
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type BillingPaymentChargeType = 'checkout' | 'recurring';

/**
 * @inline
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type BillingPaymentStatus = 'pending' | 'paid' | 'failed';

/**
 * The `BillingPaymentResource` type represents a payment attempt for a user or organization.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingPaymentResource extends ClerkResource {
  /**
   * The unique identifier for the payment.
   */
  id: string;
  /**
   * The amount of the payment.
   */
  amount: BillingMoneyAmount;
  /**
   * The date and time when the payment was successfully completed.
   */
  paidAt: Date | null;
  /**
   * The date and time when the payment failed.
   */
  failedAt: Date | null;
  /**
   * The date and time when the payment was last updated.
   */
  updatedAt: Date;
  /**
   * The payment method being used for the payment, such as credit card or bank account.
   */
  paymentMethod: BillingPaymentMethodResource | null;
  /**
   * The subscription item being paid for.
   */
  subscriptionItem: BillingSubscriptionItemResource;
  /**
   * The type of charge this payment represents. Can be `'checkout'` for one-time payments or `'recurring'` for subscription payments.
   */
  chargeType: BillingPaymentChargeType;
  /**
   * The current status of the payment.
   */
  status: BillingPaymentStatus;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetPaymentAttemptsParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetStatementsParams = WithOptionalOrgType<ClerkPaginationParams>;

/**
 * @inline
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */

export type BillingStatementStatus = 'open' | 'closed';

/**
 * The `BillingStatementResource` type represents a billing statement for a user or organization.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingStatementResource extends ClerkResource {
  /**
   * The unique identifier for the statement.
   */
  id: string;
  /**
   * An object containing the financial totals for the statement, including subtotal, grand total, tax total, credit, and past due amounts.
   */
  totals: BillingStatementTotals;
  /**
   * The current status of the statement. Statements can be either `'open'` (still accumulating charges) or `'closed'` (finalized).
   */
  status: BillingStatementStatus;
  /**
   * The date and time when the statement was created or last updated.
   */
  timestamp: Date;
  /**
   * An array of statement groups, where each group contains payment items organized by timestamp.
   */
  groups: BillingStatementGroup[];
}

/**
 * The `BillingStatementGroup` type represents a group of payment items within a statement.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type GetSubscriptionParams = {
  orgId?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type CancelSubscriptionParams = WithOptionalOrgType<unknown>;

/**
 * The `BillingSubscriptionItemResource` type represents an item in a subscription.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingSubscriptionItemResource extends ClerkResource {
  /**
   * The unique identifier for the subscription item.
   */
  id: string;
  /**
   * The plan associated with the subscription item.
   */
  plan: BillingPlanResource;
  /**
   * The billing period for the subscription item.
   */
  planPeriod: BillingSubscriptionPlanPeriod;
  /**
   * The status of the subscription item.
   */
  status: BillingSubscriptionStatus;
  /**
   * The date and time when the subscription item was created.
   */
  createdAt: Date;
  /**
   * The date and time when the subscription item became past due. `null` if the subscription item is not past due.
   */
  pastDueAt: Date | null;
  /**
   * The date and time when the current billing period starts.
   */
  periodStart: Date;
  /**
   * The date and time when the current billing period ends. `null` if not set.
   */
  periodEnd: Date | null;
  /**
   * The date and time when the subscription item was canceled. `null` if the subscription item is not canceled.
   */
  canceledAt: Date | null;
  /**
   * The amount charged for the subscription item.
   */
  amount?: BillingMoneyAmount;
  /**
   * The credit from a previous purchase that is being applied to the subscription item.
   */
  credit?: {
    /**
     * The amount of credit from a previous purchase that is being applied to the subscription item.
     */
    amount: BillingMoneyAmount;
  };
  /**
   * A function to cancel the subscription item. Accepts the following parameters:
   * <ul>
   *  <li>`orgId?` (`string`): The ID of the organization to cancel the subscription item from.</li>
   * </ul>
   *
   * @param params - The parameters for the cancel operation.
   * @returns A promise that resolves to a `DeletedObjectResource` object.
   */
  cancel: (params: CancelSubscriptionParams) => Promise<DeletedObjectResource>;
  /**
   * Whether the subscription item is for a free trial.
   */
  isFreeTrial: boolean;
}

/**
 * The `BillingSubscriptionResource` type represents a subscription to a plan.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingSubscriptionResource extends ClerkResource {
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
  nextPayment?: {
    /**
     * The amount of the next payment.
     */
    amount: BillingMoneyAmount;
    /**
     * The date when the next payment is due.
     */
    date: Date;
  };
  /**
   * The date when the subscription became past due, or `null` if the subscription is not past due.
   */
  pastDueAt: Date | null;

  /**
   * The current status of the subscription. Due to the free plan subscription item, the top level subscription can either be `active` or `past_due`.
   */
  status: Extract<BillingSubscriptionStatus, 'active' | 'past_due'>;

  /**
   * The list of subscription items included in this subscription.
   */
  subscriptionItems: BillingSubscriptionItemResource[];

  /**
   * The date when the subscription was last updated, or `null` if it hasn't been updated.
   */
  updatedAt: Date | null;

  /**
   * Whether the payer is eligible for a free trial.
   */
  eligibleForFreeTrial: boolean;
}

/**
 * The `BillingMoneyAmount` type represents a monetary value with currency information.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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
  credit: BillingMoneyAmount | null;
  /**
   * Any outstanding amount from previous unpaid invoices that is being collected as part of the checkout.
   */
  pastDue: BillingMoneyAmount | null;
  /**
   * The amount that becomes due after a free trial ends.
   */
  totalDueAfterFreeTrial: BillingMoneyAmount | null;
}

/**
 * The `BillingStatementTotals` type represents the total costs, taxes, and other pricing details for a statement.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingStatementTotals {
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
}

/**
 * The `startCheckout()` method accepts the following parameters.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type CreateCheckoutParams = WithOptionalOrgType<{
  /**
   * The unique identifier for the plan.
   */
  planId: string;
  /**
   * The billing period for the plan.
   */
  planPeriod: BillingSubscriptionPlanPeriod;
}>;

/**
 * The `confirm()` method accepts the following parameters. **Only one of `paymentMethodId`, `paymentToken`, or `useTestCard` should be provided.**
 *
 * @unionReturnHeadings
 * ["paymentMethodId", "paymentToken", "useTestCard"]
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type ConfirmCheckoutParams =
  | {
      /**
       * The ID of a saved payment method to use for this checkout.
       */
      paymentMethodId?: string;
    }
  | {
      /**
       * A token representing payment details, usually from a payment form. **Requires** `gateway` to be provided.
       */
      paymentToken?: string;
      /**
       * The payment gateway to use. **Required** if `paymentToken` or `useTestCard` is provided.
       */
      gateway?: PaymentGateway;
    }
  | {
      /**
       * The payment gateway to use. **Required** if `paymentToken` or `useTestCard` is provided.
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
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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
   * The payment method being used for the checkout, such as a credit card or bank account.
   */
  paymentMethod?: BillingPaymentMethodResource;
  /**
   * The subscription plan details for the checkout.
   */
  plan: BillingPlanResource;
  /**
   * The billing period for the plan.
   */
  planPeriod: BillingSubscriptionPlanPeriod;
  /**
   * The start date of the plan period, represented as a Unix timestamp.
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
  freeTrialEndsAt?: Date;
  /**
   * The payer associated with the checkout.
   */
  payer: BillingPayerResource;
  /**
   * Whether a payment method is required for this checkout.
   */
  needsPaymentMethod: boolean;
}

/**
 * The `BillingPayerResource` type represents a payer associated with a billing subscription.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingPayerResource extends ClerkResource {
  /**
   * The unique identifier for the payer.
   */
  id: string;
  /**
   * The date and time when the payer was created.
   */
  createdAt?: Date;
  /**
   * The date and time when the payer was last updated.
   */
  updatedAt?: Date;
  /**
   * The URL of the payer's avatar image.
   */
  imageUrl?: string;
  /**
   * The unique identifier for the payer.
   */
  userId: string | null;
  /**
   * The email address of the payer.
   */
  email?: string | null;
  /**
   * The first name of the payer.
   */
  firstName?: string | null;
  /**
   * The last name of the payer.
   */
  lastName?: string | null;
  /**
   * The unique identifier for the organization that the payer belongs to.
   */
  organizationId: string | null;
  /**
   * The name of the organization that the payer belongs to.
   */
  organizationName?: string | null;
}

export interface CheckoutFutureProperties {
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
  paymentMethod: Simplify<RemoveFunctions<BillingPaymentMethodResource>> | null;
  /**
   * The subscription plan details for the checkout.
   */
  plan: Simplify<RemoveFunctions<BillingPlanResource>>;
  /**
   * The billing period for the plan.
   */
  planPeriod: BillingSubscriptionPlanPeriod;
  /**
   * Unix timestamp (milliseconds) of when the current period starts.
   */
  planPeriodStart: number | undefined;
  /**
   * The total costs, taxes, and other pricing details for the checkout.
   */
  totals: BillingCheckoutTotals;
  /**
   * Whether the plan change will take effect immediately after checkout.
   */
  isImmediatePlanChange: boolean;
  /**
   * Unix timestamp (milliseconds) of when the free trial ends.
   */
  freeTrialEndsAt?: Date;
  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   *
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  payer: Simplify<RemoveFunctions<BillingPayerResource>>;
  /**
   * Whether a payment method is required for this checkout.
   */
  needsPaymentMethod: boolean;
}

type CheckoutPropertiesPerStatus =
  | ({
      status: 'needs_initialization';
    } & ForceNull<CheckoutFutureProperties>)
  | ({
      status: 'needs_confirmation' | 'completed';
    } & CheckoutFutureProperties);

export interface CheckoutFutureFinalizeParams {
  navigate: SetActiveNavigate;
}

export type CheckoutFutureResource = CheckoutPropertiesPerStatus & {
  /**
   * A function to confirm and finalize the checkout process, usually after payment information has been provided and validated. [Learn more.](#confirm)
   */
  confirm: (params: ConfirmCheckoutParams) => Promise<{ error: unknown }>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   *
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  start: () => Promise<{ error: unknown }>;

  /**
   * Used to convert a checkout with `status === 'completed'` into an active subscription. Will cause anything observing the
   * subscription state (such as the `useSubscription()` hook) to update automatically.
   */
  finalize: (params?: CheckoutFutureFinalizeParams) => Promise<{ error: unknown }>;
};

export type CheckoutFutureResourceLax = CheckoutFutureProperties & {
  status: 'needs_initialization' | 'needs_confirmation' | 'completed';
} & {
  /**
   * A function to confirm and finalize the checkout process, usually after payment information has been provided and validated. [Learn more.](#confirm)
   */
  confirm: (params: ConfirmCheckoutParams) => Promise<{ error: unknown }>;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   *
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  start: () => Promise<{ error: unknown }>;

  /**
   * Used to convert a checkout with `status === 'completed'` into an active subscription. Will cause anything observing the
   * subscription state (such as the `useSubscription()` hook) to update automatically.
   */
  finalize: (params?: CheckoutFutureFinalizeParams) => Promise<{ error: unknown }>;
};
