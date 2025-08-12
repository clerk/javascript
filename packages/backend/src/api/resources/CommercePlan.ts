import { Feature } from './Feature';
import type { CommercePlanJSON } from './JSON';

type CommerceFee = {
  amount: number;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version to avoid breaking changes.
 */
export class CommercePlan {
  constructor(
    /**
     * The unique identifier for the plan.
     */
    readonly id: string,
    /**
     * The id of the product the plan belongs to.
     */
    readonly productId: string,
    /**
     * The name of the plan.
     */
    readonly name: string,
    /**
     * The URL-friendly identifier of the plan.
     */
    readonly slug: string,
    /**
     * The description of the plan.
     */
    readonly description: string | undefined,
    /**
     * Whether the plan is the default plan.
     */
    readonly isDefault: boolean,
    /**
     * Whether the plan is recurring.
     */
    readonly isRecurring: boolean,
    /**
     * Whether the plan has a base fee.
     */
    readonly hasBaseFee: boolean,
    /**
     * Whether the plan is displayed in the `<PriceTable/>` component.
     */
    readonly publiclyVisible: boolean,
    /**
     * The monthly fee of the plan.
     */
    readonly fee: CommerceFee,
    /**
     * The annual fee of the plan.
     */
    readonly annualFee: CommerceFee,
    /**
     * The annual fee of the plan on a monthly basis.
     */
    readonly annualMonthlyFee: CommerceFee,
    /**
     * The type of payer for the plan.
     */
    readonly forPayerType: 'org' | 'user',
    /**
     * The features the plan offers.
     */
    readonly features: Feature[],
  ) {}

  static fromJSON(data: CommercePlanJSON): CommercePlan {
    const formatAmountJSON = (fee: CommercePlanJSON['fee']) => {
      return {
        amount: fee.amount,
        amountFormatted: fee.amount_formatted,
        currency: fee.currency,
        currencySymbol: fee.currency_symbol,
      };
    };
    return new CommercePlan(
      data.id,
      data.product_id,
      data.name,
      data.slug,
      data.description,
      data.is_default,
      data.is_recurring,
      data.has_base_fee,
      data.publicly_visible,
      formatAmountJSON(data.fee),
      formatAmountJSON(data.annual_fee),
      formatAmountJSON(data.annual_monthly_fee),
      data.for_payer_type,
      data.features.map(feature => Feature.fromJSON(feature)),
    );
  }
}
