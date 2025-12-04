import type { BillingMoneyAmount, BillingMoneyAmountJSON } from '@clerk/shared/types';

import { BillingPlan } from './CommercePlan';
import type { BillingSubscriptionItemJSON } from './JSON';

/**
 * The `BillingSubscriptionItem` object is similar to the [`BillingSubscriptionItemResource`](/docs/reference/javascript/types/billing-subscription-item-resource) object as it holds information about a subscription item, as well as methods for managing it. However, the `BillingSubscriptionItem` object is different in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/commerce/get/commerce/subscription_items) and is not directly accessible from the Frontend API.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class BillingSubscriptionItem {
  constructor(
    /**
     * The unique identifier for the subscription item.
     */
    readonly id: string,
    /**
     * The status of the subscription item.
     */
    readonly status: BillingSubscriptionItemJSON['status'],
    /**
     * The plan period for the subscription item.
     */
    readonly planPeriod: 'month' | 'annual',
    /**
     * Unix timestamp (milliseconds) of when the current period starts.
     */
    readonly periodStart: number,
    /**
     * The next payment information.
     */
    readonly nextPayment:
      | {
          /**
           * The amount of the next payment.
           */
          amount: number;
          /**
           * Unix timestamp (milliseconds) of when the next payment is scheduled.
           */
          date: number;
        }
      | null
      | undefined,
    /**
     * The current amount for the subscription item.
     */
    readonly amount: BillingMoneyAmount | undefined,
    /**
     * The plan associated with this subscription item.
     */
    readonly plan: BillingPlan | null,
    /**
     * The plan ID.
     */
    readonly planId: string | null,
    /**
     * Unix timestamp (milliseconds) of when the subscription item was created.
     */
    readonly createdAt: number,
    /**
     * Unix timestamp (milliseconds) of when the subscription item was last updated.
     */
    readonly updatedAt: number,
    /**
     * Unix timestamp (milliseconds) of when the current period ends.
     */
    readonly periodEnd: number | null,
    /**
     * Unix timestamp (milliseconds) of when the subscription item was canceled.
     */
    readonly canceledAt: number | null,
    /**
     * Unix timestamp (milliseconds) of when the subscription item became past due.
     */
    readonly pastDueAt: number | null,
    /**
     * Unix timestamp (milliseconds) of when the subscription item ended.
     */
    readonly endedAt: number | null,
    /**
     * The payer ID.
     */
    readonly payerId: string | undefined,
    /**
     * Whether this subscription item is currently in a free trial period.
     */
    readonly isFreeTrial?: boolean,
    /**
     * The lifetime amount paid for this subscription item.
     */
    readonly lifetimePaid?: BillingMoneyAmount,
  ) {}

  static fromJSON(data: BillingSubscriptionItemJSON): BillingSubscriptionItem {
    function formatAmountJSON(
      amount: BillingMoneyAmountJSON | null | undefined,
    ): BillingMoneyAmount | null | undefined {
      if (!amount) {
        return amount;
      }

      return {
        amount: amount.amount,
        amountFormatted: amount.amount_formatted,
        currency: amount.currency,
        currencySymbol: amount.currency_symbol,
      };
    }

    return new BillingSubscriptionItem(
      data.id,
      data.status,
      data.plan_period,
      data.period_start,
      data.next_payment,
      formatAmountJSON(data.amount) ?? undefined,
      data.plan ? BillingPlan.fromJSON(data.plan) : null,
      data.plan_id ?? null,
      data.created_at,
      data.updated_at,
      data.period_end,
      data.canceled_at,
      data.past_due_at,
      data.ended_at,
      data.payer_id,
      data.is_free_trial,
      formatAmountJSON(data.lifetime_paid) ?? undefined,
    );
  }
}
