import type {
  CommercePayerResourceType,
  CommercePlanJSON,
  CommercePlanJSONSnapshot,
  CommercePlanResource,
} from '@clerk/types';

import { BaseResource, CommerceFeature } from './internal';

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
  forPayerType!: CommercePayerResourceType;
  publiclyVisible!: boolean;
  slug!: string;
  avatarUrl!: string;
  features!: CommerceFeature[];
  freeTrialDays!: number | null;
  freeTrialEnabled!: boolean;

  constructor(data: CommercePlanJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommercePlanJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.amount = data.amount;
    this.amountFormatted = data.amount_formatted;
    this.annualAmount = data.annual_amount;
    this.annualAmountFormatted = data.annual_amount_formatted;
    this.annualMonthlyAmount = data.annual_monthly_amount;
    this.annualMonthlyAmountFormatted = data.annual_monthly_amount_formatted;
    this.currencySymbol = data.currency_symbol;
    this.currency = data.currency;
    this.description = data.description;
    this.isDefault = data.is_default;
    this.isRecurring = data.is_recurring;
    this.hasBaseFee = data.has_base_fee;
    this.forPayerType = data.for_payer_type;
    this.publiclyVisible = data.publicly_visible;
    this.slug = data.slug;
    this.avatarUrl = data.avatar_url;
    this.freeTrialDays = this.withDefault(data.free_trial_days, null);
    this.freeTrialEnabled = this.withDefault(data.free_trial_enabled, false);
    this.features = (data.features || []).map(feature => new CommerceFeature(feature));

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
      for_payer_type: this.forPayerType,
      publicly_visible: this.publiclyVisible,
      slug: this.slug,
      avatar_url: this.avatarUrl,
      features: this.features.map(feature => feature.__internal_toSnapshot()),
    };
  }
}
