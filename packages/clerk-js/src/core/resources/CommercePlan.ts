import type { CommercePlanJSON, CommercePlanJSONSnapshot, CommercePlanResource } from '@clerk/types';

import { CommerceFeature } from './CommerceFeature';
import { BaseResource } from './internal';
import { parseJSON } from './parser';

export class CommercePlan extends BaseResource implements CommercePlanResource {
  id!: string;
  name!: string;
  amount!: number;
  amountFormatted!: string;
  annualAmount!: number;
  annualAmountFormatted!: string;
  annualMonthlyAmount!: number;
  annualMonthlyAmountFormatted!: string;
  currencySymbol!: string;
  currency!: string;
  description!: string;
  isDefault!: boolean;
  isRecurring!: boolean;
  hasBaseFee!: boolean;
  payerType!: string[];
  publiclyVisible!: boolean;
  slug!: string;
  avatarUrl!: string;
  features!: CommerceFeature[];

  constructor(data: CommercePlanJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommercePlanJSON | null): this {
    Object.assign(
      this,
      parseJSON<CommercePlanResource>(data, {
        arrayFields: {
          features: CommerceFeature,
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): CommercePlanJSONSnapshot {
    return {
      object: 'commerce_plan',
      id: this.id,
      name: this.name,
      amount: this.amount,
      amount_formatted: this.amountFormatted,
      annual_amount: this.annualAmount,
      annual_amount_formatted: this.annualAmountFormatted,
      annual_monthly_amount: this.annualMonthlyAmount,
      annual_monthly_amount_formatted: this.annualMonthlyAmountFormatted,
      currency: this.currency,
      currency_symbol: this.currencySymbol,
      description: this.description,
      is_default: this.isDefault,
      is_recurring: this.isRecurring,
      has_base_fee: this.hasBaseFee,
      payer_type: this.payerType,
      publicly_visible: this.publiclyVisible,
      slug: this.slug,
      avatar_url: this.avatarUrl,
      features: this.features.map(feature => feature.__internal_toSnapshot()),
    };
  }
}
