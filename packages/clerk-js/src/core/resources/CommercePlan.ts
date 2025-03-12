import type { __experimental_CommercePlanJSON, __experimental_CommercePlanResource } from '@clerk/types';

import { __experimental_CommerceFeature, BaseResource } from './internal';

export class __experimental_CommercePlan extends BaseResource implements __experimental_CommercePlanResource {
  id!: string;
  name!: string;
  amount!: number;
  amountFormatted!: string;
  annualMonthlyAmount!: number;
  annualMonthlyAmountFormatted!: string;
  currencySymbol!: string;
  currency!: string;
  description!: string;
  isActiveForPayer!: boolean;
  isRecurring!: boolean;
  hasBaseFee!: boolean;
  payerType!: string[];
  publiclyVisible!: boolean;
  slug!: string;
  avatarUrl!: string;
  features!: __experimental_CommerceFeature[];

  constructor(data: __experimental_CommercePlanJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommercePlanJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.amount = data.amount;
    this.amountFormatted = data.amount_formatted;
    this.annualMonthlyAmount = data.annual_monthly_amount;
    this.annualMonthlyAmountFormatted = data.annual_monthly_amount_formatted;
    this.currencySymbol = data.currency_symbol;
    this.currency = data.currency;
    this.description = data.description;
    this.isActiveForPayer = data.is_active_for_payer;
    this.isRecurring = data.is_recurring;
    this.hasBaseFee = data.has_base_fee;
    this.payerType = data.payer_type;
    this.publiclyVisible = data.publicly_visible;
    this.slug = data.slug;
    this.avatarUrl = data.avatar_url;
    this.features = data.features.map(feature => new __experimental_CommerceFeature(feature));

    return this;
  }
}
