import type { __experimental_CommerceFeatureJSON, __experimental_CommerceFeatureResource } from '@clerk/types';

import { BaseResource } from './internal';

export class __experimental_CommerceFeature extends BaseResource implements __experimental_CommerceFeatureResource {
  id!: string;
  name!: string;
  description!: string;
  slug!: string;
  avatarUrl!: string;

  constructor(data: __experimental_CommerceFeatureJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_CommerceFeatureJSON | null): this {
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
