import type { FeatureJSON, FeatureResource } from '@clerk/types';

import { BaseResource } from './internal';

export class Feature extends BaseResource implements FeatureResource {
  id!: string;
  name!: string;
  description!: string;
  slug!: string;
  avatarUrl!: string;

  constructor(data: FeatureJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: FeatureJSON | null): this {
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
