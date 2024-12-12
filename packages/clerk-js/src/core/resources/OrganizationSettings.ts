import type {
  OrganizationEnrollmentMode,
  OrganizationSettingsJSON,
  OrganizationSettingsJSONSnapshot,
  OrganizationSettingsResource,
} from '@clerk/types';

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
    defaultRole: string | null;
  };

  public constructor(data: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null): this {
    const { enabled = false, max_allowed_memberships = 0, actions, domains } = data || {};
    this.enabled = enabled;
    this.maxAllowedMemberships = max_allowed_memberships;
    this.actions = { adminDelete: actions?.admin_delete || false };
    this.domains = {
      enabled: domains?.enabled || false,
      enrollmentModes: domains?.enrollment_modes || [],
      defaultRole: domains?.default_role || null,
    };
    return this;
  }

  public toJSON(): OrganizationSettingsJSONSnapshot {
    return {
      enabled: this.enabled,
      max_allowed_memberships: this.maxAllowedMemberships,
      actions: {
        admin_delete: this.actions.adminDelete,
      },
      domains: {
        enabled: this.domains.enabled,
        enrollment_modes: this.domains.enrollmentModes,
        default_role: this.domains.defaultRole,
      },
    } as unknown as OrganizationSettingsJSONSnapshot;
  }
}
