import type { OrganizationSettingsJSON, OrganizationSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';

export class OrganizationSettings extends BaseResource implements OrganizationSettingsResource {
  enabled!: boolean;
  maxAllowedMemberships!: number;

  public constructor(data: OrganizationSettingsJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationSettingsJSON | null): this {
    const { enabled = false, max_allowed_memberships = 0 } = data || {};
    this.enabled = enabled;
    this.maxAllowedMemberships = max_allowed_memberships;
    return this;
  }
}
