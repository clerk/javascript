import type { CommerceMoneyAmountJSON } from '@clerk/types';

import { type CommerceMoneyAmount, CommercePlan } from './CommercePlan';
import type { CommerceSubscriptionItemJSON } from './JSON';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version to avoid breaking changes.
 */
export class CommerceSubscriptionItem {
  constructor(
    /**
     * The unique identifier for the subscription item.
     */
    readonly id: string,
    /**
     * The status of the subscription item.
     */
    readonly status: CommerceSubscriptionItemJSON['status'],
    /**
     * The plan period for the subscription item.
     */
    readonly planPeriod: 'month' | 'annual',
    /**
     * The start of the current period.
     */
    readonly periodStart: number,
    /**
     * The next payment information.
     */
    readonly nextPayment: {
      amount: number;
      date: number;
    } | null,
    /**
     * The current amount for the subscription item.
     */
    readonly amount: CommerceMoneyAmount | null | undefined,
    /**
     * The plan associated with this subscription item.
     */
    readonly plan: CommercePlan,
    /**
     * The plan ID.
     */
    readonly planId: string,
    /**
     * The date and time the subscription item was created.
     */
    readonly createdAt: number,
    /**
     * The date and time the subscription item was last updated.
     */
    readonly updatedAt: number,
    /**
     * The end of the current period.
     */
    readonly periodEnd: number | null,
    /**
     * When the subscription item was canceled.
     */
    readonly canceledAt: number | null,
    /**
     * When the subscription item became past due.
     */
    readonly pastDueAt: number | null,
    /**
     * When the subscription item ended.
     */
    readonly endedAt: number | null,
    /**
     * The payer ID.
     */
    readonly payerId: string,
    /**
     /**
      * Whether this subscription item is currently in a free trial period.
      */
     readonly isFreeTrial?: boolean,
     * The lifetime amount paid for this subscription item.
     */
    readonly lifetimePaid?: CommerceMoneyAmount | null,
  ) {}

  static fromJSON(data: CommerceSubscriptionItemJSON): CommerceSubscriptionItem {
    function formatAmountJSON(
      amount: CommerceMoneyAmountJSON | null | undefined,
    ): CommerceMoneyAmount | null | undefined {
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

    return new CommerceSubscriptionItem(
      data.id,
      data.status,
      data.plan_period,
      data.period_start,
      data.next_payment,
      formatAmountJSON(data.amount),
      CommercePlan.fromJSON(data.plan),
      data.plan_id,
      data.created_at,
      data.updated_at,
      data.period_end,
      data.canceled_at,
      data.past_due_at,
      data.ended_at,
      data.payer_id,
      data.is_free_trial,
      formatAmountJSON(data.lifetime_paid),
    );
  }
}
