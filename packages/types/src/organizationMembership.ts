import type { OrganizationResource } from './organization';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';
import type { Autocomplete } from './utils';

interface Base {
  permission: string;
  role: string;
}

declare global {
  //eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ClerkAuthorization {}
}

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
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
  destroy: () => Promise<OrganizationMembershipResource>;
  update: (updateParams: UpdateOrganizationMembershipParams) => Promise<OrganizationMembershipResource>;
}

export type OrganizationCustomPermissionKey = 'permission' extends keyof ClerkAuthorization
  ? // @ts-ignore Typescript cannot infer the existence of the `permission` key even if we checking it above
    ClerkAuthorization['permission']
  : Base['permission'];

export type OrganizationCustomRoleKey = 'role' extends keyof ClerkAuthorization
  ? // @ts-ignore Typescript cannot infer the existence of the `role` key even if we checking it above
    ClerkAuthorization['role']
  : Base['role'];

/**
 * @deprecated This type is deprecated and will be removed in the next major release.
 * Use `OrganizationCustomRoleKey` instead.
 * MembershipRole includes `admin`, `basic_member`, `guest_member`. With the introduction of "Custom roles"
 * these types will no longer match a developer's custom logic.
 */
export type MembershipRole = 'role' extends keyof ClerkAuthorization
  ? // @ts-ignore Typescript cannot infer the existence of the `role` key even if we checking it above
    // Disabling eslint rule because the error causes the type to become any when accessing a property that does not exist
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    ClerkAuthorization['role'] | 'admin' | 'basic_member' | 'guest_member'
  : Autocomplete<'admin' | 'basic_member' | 'guest_member'>;

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
export type OrganizationPermissionKey = 'permission' extends keyof ClerkAuthorization
  ? // @ts-ignore Typescript cannot infer the existence of the `permission` key even if we checking it above
    // Disabling eslint rule because the error causes the type to become any when accessing a property that does not exist
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    ClerkAuthorization['permission'] | OrganizationSystemPermissionKey
  : Autocomplete<OrganizationSystemPermissionKey>;

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};
