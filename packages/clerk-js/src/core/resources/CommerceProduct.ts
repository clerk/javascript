import type { __experimental_CommerceProductJSON, __experimental_CommerceProductResource } from '@clerk/types';

import { __experimental_CommercePlan, BaseResource } from './internal';

export class __experimental_CommerceProduct extends BaseResource implements __experimental_CommerceProductResource {
  id!: string;
  slug!: string;
  currency!: string;
  isDefault!: boolean;
  plans!: __experimental_CommercePlan[];

  constructor(data: __experimental_CommerceProductJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceProductJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.slug = data.slug;
    this.currency = data.currency;
    this.isDefault = data.is_default;
    this.plans = data.plans.map(plan => new __experimental_CommercePlan(plan));

    return this;
  }
}
