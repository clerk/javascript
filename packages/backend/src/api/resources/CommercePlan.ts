import type { BillingMoneyAmount, BillingMoneyAmountJSON } from '@clerk/shared/types';

import { Feature } from './Feature';
import type { BillingPlanJSON } from './JSON';

/**
 * The `BillingPlan` object is similar to the [`BillingPlanResource`](/docs/reference/javascript/types/billing-plan-resource) object as it holds information about a Plan, as well as methods for managing it. However, the `BillingPlan` object is different in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/commerce/get/commerce/plans) and is not directly accessible from the Frontend API.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class BillingPlan {
  constructor(
    /**
     * The unique identifier for the Plan.
     */
    readonly id: string,
    /**
     * The name of the Plan.
     */
    readonly name: string,
    /**
     * The URL-friendly identifier of the Plan.
     */
    readonly slug: string,
    /**
     * The description of the Plan.
     */
    readonly description: string | null,
    /**
     * Whether the Plan is the default Plan.
     */
    readonly isDefault: boolean,
    /**
     * Whether the Plan is recurring.
     */
    readonly isRecurring: boolean,
    /**
     * Whether the Plan has a base fee.
     */
    readonly hasBaseFee: boolean,
    /**
     * Whether the Plan is displayed in the `<PriceTable/>` component.
     */
    readonly publiclyVisible: boolean,
    /**
     * The monthly fee of the Plan.
     */
    readonly fee: BillingMoneyAmount,
    /**
     * The annual fee of the Plan.
     */
    readonly annualFee: BillingMoneyAmount | null,
    /**
     * The annual fee of the Plan on a monthly basis.
     */
    readonly annualMonthlyFee: BillingMoneyAmount | null,
    /**
     * The type of payer for the Plan.
     */
    readonly forPayerType: 'org' | 'user',
    /**
     * The features the Plan offers.
     */
    readonly features: Feature[],
  ) {}

  static fromJSON(data: BillingPlanJSON): BillingPlan {
    const formatAmountJSON = <T extends BillingMoneyAmountJSON | null>(
      fee: T,
    ): T extends null ? null : BillingMoneyAmount => {
      return (
        fee
          ? {
              amount: fee.amount,
              amountFormatted: fee.amount_formatted,
              currency: fee.currency,
              currencySymbol: fee.currency_symbol,
            }
          : null
      ) as T extends null ? null : BillingMoneyAmount;
    };
    return new BillingPlan(
      data.id,
      data.name,
      data.slug,
      data.description ?? null,
      data.is_default,
      data.is_recurring,
      data.has_base_fee,
      data.publicly_visible,
      formatAmountJSON(data.fee),
      formatAmountJSON(data.annual_fee),
      formatAmountJSON(data.annual_monthly_fee),
      data.for_payer_type,
      (data.features ?? []).map(feature => Feature.fromJSON(feature)),
    );
  }
}
