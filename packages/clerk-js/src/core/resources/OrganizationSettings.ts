import type { OrganizationSettingsJSON, OrganizationSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';

export class OrganizationSettings extends BaseResource implements OrganizationSettingsResource {
  enabled!: boolean;
  maxAllowedMemberships!: number;

  public constructor(data: OrganizationSettingsJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationSettingsJSON): this {
    data = data || {};
    this.enabled = data.enabled || false;
    this.maxAllowedMemberships = data.max_allowed_memberships || 0;
    return this;
  }
}
