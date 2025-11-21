import type {
  BillingMoneyAmount,
  BillingPayerResourceType,
  BillingPlanJSON,
  BillingPlanResource,
} from '@clerk/shared/types';

import { billingMoneyAmountFromJSON } from '@/utils/billing';

import { BaseResource } from './Base';
import { Feature } from './internal';

export class BillingPlan extends BaseResource implements BillingPlanResource {
  id!: string;
  name!: string;
  fee!: BillingMoneyAmount;
  annualFee: BillingMoneyAmount | null = null;
  annualMonthlyFee: BillingMoneyAmount | null = null;
  description: string | null = null;
  isDefault!: boolean;
  isRecurring!: boolean;
  hasBaseFee!: boolean;
  forPayerType!: BillingPayerResourceType;
  publiclyVisible!: boolean;
  slug!: string;
  avatarUrl: string | null = null;
  features!: Feature[];
  freeTrialDays!: number | null;
  freeTrialEnabled!: boolean;

  constructor(data: BillingPlanJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: BillingPlanJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.fee = billingMoneyAmountFromJSON(data.fee);
    this.annualFee = data.annual_fee ? billingMoneyAmountFromJSON(data.annual_fee) : null;
    this.annualMonthlyFee = data.annual_monthly_fee ? billingMoneyAmountFromJSON(data.annual_monthly_fee) : null;
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
    this.features = (data.features || []).map(feature => new Feature(feature));

    return this;
  }
}
