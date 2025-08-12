import type {
  CommerceMoneyAmount,
  CommercePayerResourceType,
  CommercePlanJSON,
  CommercePlanResource,
} from '@clerk/types';

import { commerceMoneyAmountFromJSON } from '@/utils/commerce';

import { BaseResource, CommerceFeature } from './internal';

export class CommercePlan extends BaseResource implements CommercePlanResource {
  id!: string;
  name!: string;
  fee!: CommerceMoneyAmount;
  annualFee!: CommerceMoneyAmount;
  annualMonthlyFee!: CommerceMoneyAmount;
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
    this.fee = commerceMoneyAmountFromJSON(data.fee);
    this.annualFee = commerceMoneyAmountFromJSON(data.annual_fee);
    this.annualMonthlyFee = commerceMoneyAmountFromJSON(data.annual_monthly_fee);
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
}
