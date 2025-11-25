import type { BillingMoneyAmount } from '@clerk/types';

import { BillingSubscriptionItem } from './CommerceSubscriptionItem';
import type { BillingSubscriptionJSON } from './JSON';

/**
 * The `BillingSubscription` object is similar to the [`BillingSubscriptionResource`](/docs/reference/javascript/types/billing-subscription-resource) object as it holds information about a subscription, as well as methods for managing it. However, the `BillingSubscription` object is different in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/billing/get/organizations/%7Borganization_id%7D/billing/subscription) and is not directly accessible from the Frontend API.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class BillingSubscription {
  constructor(
    /**
     * The unique identifier for the billing subscription.
     */
    readonly id: string,
    /**
     * The current status of the subscription.
     */
    readonly status: BillingSubscriptionJSON['status'],
    /**
     * The ID of the payer for this subscription.
     */
    readonly payerId: string,
    /**
     * Unix timestamp (milliseconds) of when the subscription was created.
     */
    readonly createdAt: number,
    /**
     * Unix timestamp (milliseconds) of when the subscription was last updated.
     */
    readonly updatedAt: number,
    /**
     * Unix timestamp (milliseconds) of when the subscription became active.
     */
    readonly activeAt: number | null,
    /**
     * Unix timestamp (milliseconds) of when the subscription became past due.
     */
    readonly pastDueAt: number | null,
    /**
     * Array of subscription items in this subscription.
     */
    readonly subscriptionItems: BillingSubscriptionItem[],
    /**
     * Information about the next scheduled payment.
     */
    readonly nextPayment: { date: number; amount: BillingMoneyAmount } | null,
    /**
     * Whether the payer is eligible for a free trial.
     */
    readonly eligibleForFreeTrial: boolean,
  ) {}

  static fromJSON(data: BillingSubscriptionJSON): BillingSubscription {
    const nextPayment = data.next_payment
      ? {
          date: data.next_payment.date,
          amount: {
            amount: data.next_payment.amount.amount,
            amountFormatted: data.next_payment.amount.amount_formatted,
            currency: data.next_payment.amount.currency,
            currencySymbol: data.next_payment.amount.currency_symbol,
          },
        }
      : null;

    return new BillingSubscription(
      data.id,
      data.status,
      data.payer_id,
      data.created_at,
      data.updated_at,
      data.active_at ?? null,
      data.past_due_at ?? null,
      (data.subscription_items ?? []).map(item => BillingSubscriptionItem.fromJSON(item)),
      nextPayment,
      data.eligible_for_free_trial ?? false,
    );
  }
}
