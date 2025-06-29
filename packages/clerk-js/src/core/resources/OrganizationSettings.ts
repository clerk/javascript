import type {
  OrganizationSettingsJSON,
  OrganizationSettingsJSONSnapshot,
  OrganizationSettingsResource,
} from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

export class OrganizationSettings extends BaseResource implements OrganizationSettingsResource {
  actions = {
    adminDelete: false,
  };

  domains = {
    enabled: false,
    enrollmentModes: [],
    defaultRole: '',
  };

  enabled = false;
  maxAllowedMemberships = 1;
  forceOrganizationSelection = false;

  public constructor(data: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    Object.assign(
      this,
      parseJSON<OrganizationSettingsResource>(data, {
        customTransforms: {
          actions: value => ({
            adminDelete: value?.admin_delete || false,
          }),
          domains: value => ({
            enabled: value?.enabled || false,
            enrollmentModes: value?.enrollment_modes || [],
            defaultRole: value?.default_role || '',
          }),
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): OrganizationSettingsJSONSnapshot {
    return {
      id: this.id || '',
      object: 'organization_settings',
      actions: {
        admin_delete: this.actions.adminDelete,
      },
      domains: {
        enabled: this.domains.enabled,
        enrollment_modes: this.domains.enrollmentModes,
        default_role: this.domains.defaultRole,
      },
      enabled: this.enabled,
      max_allowed_memberships: this.maxAllowedMemberships,
      force_organization_selection: this.forceOrganizationSelection,
    } as unknown as OrganizationSettingsJSONSnapshot;
  }
}
