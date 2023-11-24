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
  /**
   * @experimental The property is experimental and subject to change in future releases.
   */
  permissions: OrganizationPermission[];
  publicMetadata: OrganizationMembershipPublicMetadata;
  publicUserData: PublicUserData;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
  destroy: () => Promise<OrganizationMembershipResource>;
  update: (updateParams: UpdateOrganizationMembershipParams) => Promise<OrganizationMembershipResource>;
}

export type OrganizationCustomPermission = string;
export type OrganizationCustomRole = string;

/**
 * @deprecated This type is deprecated and will be removed in the next major release.
 * Use `OrganizationCustomRole` instead.
 * MembershipRole includes `admin`, `basic_member`, `guest_member`. With the introduction of "Custom roles"
 * these types will no longer match a developer's custom logic.
 */
export type MembershipRole = Autocomplete<'admin' | 'basic_member' | 'guest_member'>;

export type OrganizationSystemPermission =
  | 'org:sys_domains:manage'
  | 'org:sys_domains:delete'
  | 'org:sys_profile:manage'
  | 'org:sys_profile:delete'
  | 'org:sys_memberships:read'
  | 'org:sys_memberships:manage'
  | 'org:sys_memberships:delete'
  | 'org:sys_domains:read';

/**
 * OrganizationPermission is a combination of system and custom permissions.
 * System permissions are only accessible from FAPI and client-side operations/utils
 */
export type OrganizationPermission = Autocomplete<OrganizationSystemPermission>;

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};
