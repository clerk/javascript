import type { DomainsEnrollmentModes } from './Enums';
import type { OrganizationSettingsJSON } from './JSON';

export class OrganizationSettings {
  constructor(
    readonly enabled: boolean,
    readonly maxAllowedMemberships: number,
    readonly maxAllowedRoles: number,
    readonly maxAllowedPermissions: number,
    readonly creatorRole: string,
    readonly adminDeleteEnabled: boolean,
    readonly domainsEnabled: boolean,
    readonly slugDisabled: boolean,
    readonly domainsEnrollmentModes: Array<DomainsEnrollmentModes>,
    readonly domainsDefaultRole: string,
  ) {}

  static fromJSON(data: OrganizationSettingsJSON): OrganizationSettings {
    return new OrganizationSettings(
      data.enabled,
      data.max_allowed_memberships,
      data.max_allowed_roles,
      data.max_allowed_permissions,
      data.creator_role,
      data.admin_delete_enabled,
      data.domains_enabled,
      data.slug_disabled,
      data.domains_enrollment_modes,
      data.domains_default_role,
    );
  }
}
