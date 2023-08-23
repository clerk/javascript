import type { OrganizationEnrollmentMode, OrganizationSettingsJSON, OrganizationSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';

export class OrganizationSettings extends BaseResource implements OrganizationSettingsResource {
  enabled!: boolean;
  maxAllowedMemberships!: number;
  actions!: {
    adminDelete: boolean;
  };
  domains!: {
    enabled: boolean;
    enrollmentModes: OrganizationEnrollmentMode[];
  };

  public constructor(data: OrganizationSettingsJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationSettingsJSON | null): this {
    const { enabled = false, max_allowed_memberships = 0, actions, domains } = data || {};
    this.enabled = enabled;
    this.maxAllowedMemberships = max_allowed_memberships;
    this.actions = { adminDelete: actions?.admin_delete || false };
    this.domains = {
      enabled: domains?.enabled || false,
      enrollmentModes: domains?.enrollment_modes || [],
    };
    return this;
  }
}
