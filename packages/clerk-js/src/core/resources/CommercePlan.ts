import type { CommercePlanJSON, CommercePlanJSONSnapshot, CommercePlanResource } from '@clerk/types';

import { CommerceFeature } from './CommerceFeature';
import { BaseResource } from './internal';
import { parseJSON, serializeToJSON } from './parser';

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
      ...serializeToJSON(this, {
        arrayFields: ['features'],
      }),
    } as CommercePlanJSONSnapshot;
  }
}
