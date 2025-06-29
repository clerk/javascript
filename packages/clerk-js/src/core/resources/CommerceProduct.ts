import type { CommerceProductJSON, CommerceProductResource } from '@clerk/types';

import { BaseResource, CommercePlan } from './internal';

export class CommerceProduct extends BaseResource implements CommerceProductResource {
  id!: string;
  slug!: string;
  currency!: string;
  isDefault!: boolean;
  plans!: CommercePlan[];

  constructor(data: CommerceProductJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceProductJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.slug = data.slug;
    this.currency = data.currency;
    this.isDefault = data.is_default;
    this.plans = data.plans.map(plan => new CommercePlan(plan));

    return this;
  }
}
