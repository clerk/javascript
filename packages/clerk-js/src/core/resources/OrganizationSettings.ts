import type {
  OrganizationEnrollmentMode,
  OrganizationSettingsJSON,
  OrganizationSettingsJSONSnapshot,
  OrganizationSettingsResource,
} from '@clerk/shared/types';

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
  slug: {
    disabled: boolean;
  } = {
    disabled: false,
  };
  enabled: boolean = false;
  maxAllowedMemberships: number = 1;
  forceOrganizationSelection!: boolean;

  public constructor(data: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    if (data.actions) {
      this.actions.adminDelete = this.withDefault(data.actions.admin_delete, this.actions.adminDelete);
    }

    if (data.domains) {
      this.domains.enabled = this.withDefault(data.domains.enabled, this.domains.enabled);
      this.domains.enrollmentModes = this.withDefault(data.domains.enrollment_modes, this.domains.enrollmentModes);
      this.domains.defaultRole = this.withDefault(data.domains.default_role, this.domains.defaultRole);
    }

    if (data.slug) {
      this.slug.disabled = this.withDefault(data.slug.disabled, this.slug.disabled);
    }

    this.enabled = this.withDefault(data.enabled, this.enabled);
    this.maxAllowedMemberships = this.withDefault(data.max_allowed_memberships, this.maxAllowedMemberships);
    this.forceOrganizationSelection = this.withDefault(
      data.force_organization_selection,
      this.forceOrganizationSelection,
    );

    return this;
  }

  public __internal_toSnapshot(): OrganizationSettingsJSONSnapshot {
    return {
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
    } as unknown as OrganizationSettingsJSONSnapshot;
  }

  /**
   * Used to enable the Organizations feature in memory after it has been enabled in the backend
   * from the devtools resource, since it cannot return the updated environment due to API caching
   */
  public __internal_enableInMemory() {
    this.enabled = true;
  }
}
