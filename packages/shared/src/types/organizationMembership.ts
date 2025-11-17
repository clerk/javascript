import type { OrganizationResource } from './organization';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';
import type { OrganizationMembershipJSONSnapshot } from './snapshots';
import type { Autocomplete } from './utils';

interface Base {
  permission: string;
  role: string;
}

interface Placeholder {
  permission: unknown;
  role: unknown;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

/**
 * The `OrganizationMembership` object is the model around an organization membership entity and describes the relationship between users and organizations.
 *
 * @interface
 */
export interface OrganizationMembershipResource extends ClerkResource {
  id: string;
  organization: OrganizationResource;
  permissions: OrganizationPermissionKey[];
  publicMetadata: OrganizationMembershipPublicMetadata;
  publicUserData?: PublicUserData;
  role: OrganizationCustomRoleKey;
  roleName: string;
  createdAt: Date;
  updatedAt: Date;
  destroy: () => Promise<OrganizationMembershipResource>;
  update: (updateParams: UpdateOrganizationMembershipParams) => Promise<OrganizationMembershipResource>;
  /**
   * @internal
   */
  __internal_toSnapshot: () => OrganizationMembershipJSONSnapshot;
}

export type OrganizationCustomPermissionKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['permission'] extends string
    ? ClerkAuthorization['permission']
    : Base['permission']
  : Base['permission'];

/**
 * `OrganizationCustomRoleKey` is a type that represents the user's role in an organization. It will be string unless the developer has provided their own types through [`ClerkAuthorization`](https://clerk.com/docs/guides/development/override-clerk-types-interfaces#example-custom-roles-and-permissions).
 *
 * Clerk provides the [default roles](https://clerk.com/docs/guides/organizations/roles-and-permissions#default-roles) `org:admin` and `org:member`. However, you can create [custom roles](https://clerk.com/docs/guides/organizations/roles-and-permissions#custom-roles) as well.
 *
 * @interface
 */
export type OrganizationCustomRoleKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['role'] extends string
    ? ClerkAuthorization['role']
    : Base['role']
  : Base['role'];

export type OrganizationSystemPermissionPrefix = 'org:sys_';
export type OrganizationSystemPermissionKey =
  | `${OrganizationSystemPermissionPrefix}domains:manage`
  | `${OrganizationSystemPermissionPrefix}profile:manage`
  | `${OrganizationSystemPermissionPrefix}profile:delete`
  | `${OrganizationSystemPermissionPrefix}memberships:read`
  | `${OrganizationSystemPermissionPrefix}memberships:manage`
  | `${OrganizationSystemPermissionPrefix}domains:read`;

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
