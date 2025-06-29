import type { CommerceFeatureJSON, CommerceFeatureJSONSnapshot, CommerceFeatureResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

export class CommerceFeature extends BaseResource implements CommerceFeatureResource {
  id!: string;
  name!: string;
  description!: string;
  slug!: string;
  avatarUrl!: string;

  constructor(data: CommerceFeatureJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceFeatureJSON | null): this {
    if (!data) {
      return this;
    }

    Object.assign(this, parseJSON<CommerceFeatureResource>(data));
    return this;
  }

  public __internal_toSnapshot(): CommerceFeatureJSONSnapshot {
    return {
      object: 'commerce_feature',
      id: this.id,
      name: this.name,
      description: this.description,
      slug: this.slug,
      avatar_url: this.avatarUrl,
    };
  }
}
