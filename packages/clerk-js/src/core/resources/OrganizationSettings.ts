import type {
  OrganizationEnrollmentMode,
  OrganizationSettingsJSON,
  OrganizationSettingsJSONSnapshot,
  OrganizationSettingsResource,
} from '@clerk/types';

import { BaseResource } from './internal';

export class OrganizationSettings extends BaseResource implements OrganizationSettingsResource {
  actions: { adminDelete: boolean } = { adminDelete: false };
  domains: {
    enabled: boolean;
    enrollmentModes: OrganizationEnrollmentMode[];
    defaultRole: string | null;
  } = {
    enabled: false,
    enrollmentModes: [],
    defaultRole: null,
  };
  enabled: boolean = false;
  maxAllowedMemberships: number = 0;

  public constructor(data?: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null) {
    super();
    if (data) {
      this.fromJSON(data);
    }
  }

  protected fromJSON(data: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    if (data.actions) {
      this.actions.adminDelete = data.actions.admin_delete ?? this.actions.adminDelete;
    }

    if (data.domains) {
      this.domains.enabled = data.domains.enabled ?? this.domains.enabled;
      this.domains.enrollmentModes = data.domains.enrollment_modes ?? this.domains.enrollmentModes;
      this.domains.defaultRole = data.domains.default_role ?? this.domains.defaultRole;
    }

    this.enabled = data.enabled ?? this.enabled;
    this.maxAllowedMemberships = data.max_allowed_memberships ?? this.maxAllowedMemberships;

    return this;
  }

  public __internal_toSnapshot(): OrganizationSettingsJSONSnapshot {
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
