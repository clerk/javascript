import type {
  OrganizationSettingsJSON,
  OrganizationSettingsJSONSnapshot,
  OrganizationSettingsResource,
} from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON, serializeToJSON } from './parser';

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
      object: 'organization_settings',
      ...serializeToJSON(this, {
        customTransforms: {
          actions: value => ({ admin_delete: value.adminDelete }),
          domains: value => ({
            enabled: value.enabled,
            enrollment_modes: value.enrollmentModes,
            default_role: value.defaultRole,
          }),
        },
      }),
    } as OrganizationSettingsJSONSnapshot;
  }
}
