import type { ClerkResourceJSON } from './json';
import type { OrganizationEnrollmentMode } from './organizationDomain';
import type { ClerkResource } from './resource';
import type { OrganizationSettingsJSONSnapshot } from './snapshots';

export interface OrganizationSettingsJSON extends ClerkResourceJSON {
  id: never;
  object: never;
  enabled: boolean;
  max_allowed_memberships: number;
  force_organization_selection: boolean;
  actions: {
    admin_delete: boolean;
  };
  domains: {
    enabled: boolean;
    enrollment_modes: OrganizationEnrollmentMode[];
    default_role: string | null;
  };
  slug: {
    disabled: boolean;
  };
  organization_creation_defaults: {
    enabled: boolean;
  };
}

/**
 * The `OrganizationSettings` object holds the Organization-related settings configured for the instance.
 *
 * @interface
 */
export interface OrganizationSettingsResource extends ClerkResource {
  /**
   * Whether Organizations are enabled for the instance.
   */
  enabled: boolean;
  /**
   * The maximum number of memberships allowed per Organization.
   */
  maxAllowedMemberships: number;
  /**
   * Whether users are required to select an Organization after signing in.
   */
  forceOrganizationSelection: boolean;
  /**
   * The Organization-related actions that are enabled for the instance.
   */
  actions: {
    /**
     * Whether admins are allowed to delete Organizations.
     */
    adminDelete: boolean;
  };
  /**
   * The settings that control Organization [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) and member enrollment.
   */
  domains: {
    /**
     * Whether Verified Domains are enabled.
     */
    enabled: boolean;
    /**
     * The enrollment modes that are available for Verified Domains.
     *
     * <ul>
     *  <li>`manual_invitation`: No automatic enrollment. Users with a matching email domain are not given any [invitation](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-invitations) or [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions); an admin must invite them manually.</li>
     *  <li>`automatic_invitation`: Users with a matching email domain automatically receive a pending [invitation](https://clerk.com/docs/reference/types/organizationinvitation) (assigned the Organization's default role) which they can accept to join.</li>
     *  <li>`automatic_suggestion`: Users with a matching email domain automatically receive a [suggestion](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions) to join, which they can request.</li>
     * </ul>
     */
    enrollmentModes: OrganizationEnrollmentMode[];
    /**
     * The default Role assigned to users enrolled through a domain, or `null` if there is none.
     */
    defaultRole: string | null;
  };
  /**
   * The settings that control Organization slugs.
   */
  slug: {
    /**
     * Whether Organization slugs are disabled.
     */
    disabled: boolean;
  };
  /**
   * The settings that control the defaults used when creating an Organization.
   */
  organizationCreationDefaults: {
    /**
     * Whether Organization creation defaults are enabled.
     */
    enabled: boolean;
  };
  /**
   * @hidden
   */
  __internal_toSnapshot: () => OrganizationSettingsJSONSnapshot;
}
