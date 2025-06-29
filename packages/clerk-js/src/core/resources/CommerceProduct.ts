import type { CommerceProductJSON, CommerceProductResource } from '@clerk/types';

import { CommercePlan } from './CommercePlan';
import { BaseResource } from './internal';
import { parseJSON } from './parser';

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

    Object.assign(
      this,
      parseJSON<CommerceProductResource>(data, {
        arrayFields: {
          plans: CommercePlan,
        },
      }),
    );
    return this;
  }
}
