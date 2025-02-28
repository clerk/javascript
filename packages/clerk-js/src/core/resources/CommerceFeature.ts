import type { CommerceFeatureJSON, CommerceFeatureResource } from '@clerk/types';

import { BaseResource } from './internal';

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

    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.slug = data.slug;
    this.avatarUrl = data.avatar_url;

    return this;
  }
}
