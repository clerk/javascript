import { Feature } from './Feature';
import type { CommercePlanJSON } from './JSON';

/**
 * The Backend `Organization` object is similar to the [`Organization`](https://clerk.com/docs/references/javascript/organization) object as it holds information about an organization, as well as methods for managing it. However, the Backend `Organization` object is different in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/ListOrganizations){{ target: '_blank' }} and is not directly accessible from the Frontend API.
 */

type CommerceAmount = {
  amount: number;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
};

export class CommercePlan {
  constructor(
    /**
     * The unique identifier for the organization.
     */
    readonly id: string,
    /**
     * The name of the organization.
     */
    readonly productId: string,
    /**
     * The URL-friendly identifier of the user's active organization. If supplied, it must be unique for the instance.
     */
    readonly name: string,
    /**
     * Holds the organization's logo. Compatible with Clerk's [Image Optimization](https://clerk.com/docs/guides/image-optimization).
     */
    readonly slug: string,
    /**
     * Whether the organization has an image.
     */
    readonly description: string | undefined,
    /**
     * The date when the organization was first created.
     */
    readonly isDefault: boolean,
    /**
     * The date when the organization was last updated.
     */
    readonly isRecurring: boolean,
    /**
     * Metadata that can be read from the Frontend API and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }} and can be set only from the Backend API.
     */
    readonly amount: number,
    /**
     * Metadata that can be read and set only from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}.
     */
    readonly period: 'month' | 'annual',
    /**
     * The maximum number of memberships allowed in the organization.
     */
    readonly interval: number,
    /**
     * Whether the organization allows admins to delete users.
     */
    readonly hasBaseFee: boolean,
    /**
     * The number of members in the organization.
     */
    readonly currency: string,
    /**
     * The ID of the user who created the organization.
     */
    readonly annualMonthlyAmount: number,
    /**
     * Whether the organization allows admins to delete users.
     */
    readonly publiclyVisible: boolean,
    readonly fee: CommerceAmount,
    readonly annualFee: CommerceAmount,
    readonly annualMonthlyFee: CommerceAmount,
    readonly forPayerType: 'org' | 'user',
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
      data.amount,
      data.period,
      data.interval,
      data.has_base_fee,
      data.currency,
      data.annual_monthly_amount,
      data.publicly_visible,
      formatAmountJSON(data.fee),
      formatAmountJSON(data.annual_fee),
      formatAmountJSON(data.annual_monthly_fee),
      data.for_payer_type,
      data.features.map(feature => Feature.fromJSON(feature)),
    );
  }
}
