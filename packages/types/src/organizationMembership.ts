import type { Autocomplete } from 'utils';

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

export type OrganizationPermission = OrganizationSystemPermission | OrganizationCustomPermission;

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};
