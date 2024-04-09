import type { CustomPermissionKey, CustomPlanKey, CustomRoleKey, Placeholder } from './authorization';
import type { OrganizationResource } from './organization';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';
import type { Autocomplete } from './utils';

declare global {
  /**
   * If you want to provide custom types for the organizationMembership.publicMetadata
   * object, simply redeclare this rule in the global namespace.
   * Every organizationMembership object will use the provided type.
   */
  interface OrganizationMembershipPublicMetadata {
    [k: string]: unknown;
  }

  /**
   * If you want to provide custom types for the organizationMembership.publicMetadata
   * object, simply redeclare this rule in the global namespace.
   * Every organizationMembership object will use the provided type.
   */
  interface OrganizationMembershipPrivateMetadata {
    [k: string]: unknown;
  }
}

export interface OrganizationMembershipResource extends ClerkResource {
  id: string;
  organization: OrganizationResource;
  permissions: OrganizationPermissionKey[];
  publicMetadata: OrganizationMembershipPublicMetadata;
  publicUserData: PublicUserData;
  role: OrganizationCustomRoleKey;
  orgPlan?: CustomPlanKey;
  createdAt: Date;
  updatedAt: Date;
  destroy: () => Promise<OrganizationMembershipResource>;
  update: (updateParams: UpdateOrganizationMembershipParams) => Promise<OrganizationMembershipResource>;
}

export type OrganizationCustomPermissionKey = CustomPermissionKey;
/**
 * OrganizationCustomRoleKey will be string unless the developer has provided their own types through `ClerkAuthorization`
 */
export type OrganizationCustomRoleKey = CustomRoleKey;

export type OrganizationSystemPermissionKey =
  | 'org:sys_domains:manage'
  | 'org:sys_profile:manage'
  | 'org:sys_profile:delete'
  | 'org:sys_memberships:read'
  | 'org:sys_memberships:manage'
  | 'org:sys_domains:read';

/**
 * OrganizationPermissionKey is a combination of system and custom permissions.
 * System permissions are only accessible from FAPI and client-side operations/utils
 */
export type OrganizationPermissionKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['permission'] extends string
    ? ClerkAuthorization['permission'] | OrganizationSystemPermissionKey
    : Autocomplete<OrganizationSystemPermissionKey>
  : Autocomplete<OrganizationSystemPermissionKey>;

export type UpdateOrganizationMembershipParams = {
  role: OrganizationCustomRoleKey;
};
