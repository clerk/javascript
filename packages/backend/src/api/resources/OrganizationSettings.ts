import type { DomainsEnrollmentModes } from './Enums';
import type { OrganizationSettingsJSON } from './JSON';

/** The `OrganizationSettings` object represents the [Organization-related settings](https://clerk.com/docs/guides/organizations/configure) for the current instance. */
export class OrganizationSettings {
  constructor(
    /** Whether the instance has [Organizations](https://clerk.com/docs/guides/organizations/overview) enabled. */
    readonly enabled: boolean,
    /** The maximum number of [memberships allowed](https://clerk.com/docs/guides/organizations/configure#membership-limits) per Organization. */
    readonly maxAllowedMemberships: number,
    /** The maximum number of Roles allowed per Organization. */
    readonly maxAllowedRoles: number,
    /** The maximum number of Permissions allowed per Organization. */
    readonly maxAllowedPermissions: number,
    /** The default [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) for an Organization creator. */
    readonly creatorRole: string,
    /** Whether [admins](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions#default-roles) are allowed to delete Organizations. */
    readonly adminDeleteEnabled: boolean,
    /** Whether the instance has [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) enabled. */
    readonly domainsEnabled: boolean,
    /** Whether the instance has [Organization slugs](https://clerk.com/docs/guides/organizations/configure#organization-slugs) disabled. */
    readonly slugDisabled: boolean,
    /**
     * The [enrollment modes](https://clerk.com/docs/guides/organizations/add-members/verified-domains#enable-verified-domains) available for Verified Domains.
     *
     * <ul>
     *  <li>`manual_invitation`: No automatic enrollment. Users with a matching email domain are not given any [invitation](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-invitations) or [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions); an [admin](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions#default-roles) must invite them manually.</li>
     *  <li>`automatic_invitation`: Users with a matching email domain automatically receive a pending [invitation](https://clerk.com/docs/reference/types/organization-invitation) (assigned the Organization's default Role) which they can accept to join.</li>
     *  <li>`automatic_suggestion`: Users with a matching email domain automatically receive a [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions) to join, which they can request.</li>
     * </ul>
     */
    readonly domainsEnrollmentModes: Array<DomainsEnrollmentModes>,
    /** The default [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) for the Organization's [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains). */
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
