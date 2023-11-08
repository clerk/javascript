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
}

export interface OrganizationMembershipResource extends ClerkResource {
  id: string;
  organization: OrganizationResource;
  /**
   * @experimental The property is experimental and subject to change in future releases.
   */
  // Adding (string & {}) allows for getting eslint autocomplete but also accepts any string
  // eslint-disable-next-line
  permissions: (OrganizationPermission | (string & {}))[];
  publicMetadata: OrganizationMembershipPublicMetadata;
  publicUserData: PublicUserData;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
  destroy: () => Promise<OrganizationMembershipResource>;
  update: (updateParams: UpdateOrganizationMembershipParams) => Promise<OrganizationMembershipResource>;
}

// Adding (string & {}) allows for getting eslint autocomplete but also accepts any string
// eslint-disable-next-line
export type MembershipRole = 'admin' | 'basic_member' | 'guest_member' | (string & {});

export type OrganizationPermission =
  | 'org:sys_domains:manage'
  | 'org:sys_domains:delete'
  | 'org:sys_profile:manage'
  | 'org:sys_profile:delete'
  | 'org:sys_memberships:read'
  | 'org:sys_memberships:manage'
  | 'org:sys_memberships:delete'
  | 'org:sys_domains:read';

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};
