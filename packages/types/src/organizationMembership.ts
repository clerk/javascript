import type { OrganizationResource } from './organization';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';

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

  interface OrganizationCustomPermissions {
    [k: string]: string;
  }

  interface OrganizationCustomRoles {
    [k: string]: string;
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

export type OrganizationCustomPermission = OrganizationCustomPermissions[keyof OrganizationCustomPermissions];
export type OrganizationCustomRole = OrganizationCustomRoles[keyof OrganizationCustomRoles];

/**
 * @deprecated This type is deprecated and will be removed in the next major release.
 * Instead, override the type like this
 * ```
 * declare global {
 *  interface OrganizationCustomRoles {
 *     "org:custom_role1": "org:custom_role1";
 *     "org:custom_role2": "org:custom_role2";
 *   }
 * }
 * ```
 * MembershipRole includes `admin`, `basic_member`, `guest_member`. With the introduction of "Custom roles"
 * these types will no longer match a developer's custom logic.
 */
export type MembershipRole = 'admin' | 'basic_member' | 'guest_member' | OrganizationCustomRole;

export type OrganizationSystemPermission =
  | 'org:sys_domains:manage'
  | 'org:sys_profile:manage'
  | 'org:sys_profile:delete'
  | 'org:sys_memberships:read'
  | 'org:sys_memberships:manage'
  | 'org:sys_domains:read';

export type OrganizationPermission = OrganizationSystemPermission | OrganizationCustomPermission;

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};
