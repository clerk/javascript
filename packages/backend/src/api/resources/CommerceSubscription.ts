import { type CommerceMoneyAmount } from './CommercePlan';
import { CommerceSubscriptionItem } from './CommerceSubscriptionItem';
import type { CommerceSubscriptionJSON } from './JSON';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version to avoid breaking changes.
 */
export class CommerceSubscription {
  constructor(
    /**
     * The unique identifier for the commerce subscription.
     */
    readonly id: string,
    /**
     * The current status of the subscription.
     */
    readonly status: CommerceSubscriptionJSON['status'],
    /**
     * The ID of the payer for this subscription.
     */
    readonly payerId: string,
    /**
     * Unix timestamp (milliseconds) of creation.
     */
    readonly createdAt: number,
    /**
     * Unix timestamp (milliseconds) of last update.
     */
    readonly updatedAt: number,
    /**
     * Unix timestamp (milliseconds) when the subscription became active.
     */
    readonly activeAt: number | null,
    /**
     * Unix timestamp (milliseconds) when the subscription became past due.
     */
    readonly pastDueAt: number | null,
    /**
     * Array of subscription items in this subscription.
     */
    readonly subscriptionItems: CommerceSubscriptionItem[],
    /**
     * Information about the next scheduled payment.
     */
    readonly nextPayment: { date: number; amount: CommerceMoneyAmount } | null,
    /**
     * Whether the payer is eligible for a free trial.
     */
    readonly eligibleForFreeTrial: boolean,
  ) {}

  static fromJSON(data: CommerceSubscriptionJSON): CommerceSubscription {
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

    return new CommerceSubscription(
      data.id,
      data.status,
      data.payer_id,
      data.created_at,
      data.updated_at,
      data.active_at ?? null,
      data.past_due_at ?? null,
      data.subscription_items.map(item => CommerceSubscriptionItem.fromJSON(item)),
      nextPayment,
      data.eligible_for_free_trial ?? false,
    );
  }
}
