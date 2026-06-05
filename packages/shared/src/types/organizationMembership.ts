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
   * If you want to provide custom types for the `organizationMembership.publicMetadata` object, simply redeclare this rule in the global namespace. Every `OrganizationMembership` will use the provided type.
   */
  interface OrganizationMembershipPublicMetadata {
    [k: string]: unknown;
  }

  /**
   * If you want to provide custom types for the `organizationMembership.privateMetadata` object, simply redeclare this rule in the global namespace. Every `OrganizationMembership` will use the provided type.
   */
  interface OrganizationMembershipPrivateMetadata {
    [k: string]: unknown;
  }
}

/**
 * The `OrganizationMembership` object is the model around a user's membership in an Organization.
 *
 * @interface
 */
export interface OrganizationMembershipResource extends ClerkResource {
  /**
   * The unique identifier for the membership.
   */
  id: string;
  /**
   * The [`Organization`](https://clerk.com/docs/reference/types/organization) object the membership belongs to.
   */
  organization: OrganizationResource;
  /**
   * The [Permissions](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) the member has in the Organization.
   */
  permissions: OrganizationPermissionKey[];
  /**
   * Metadata that can be read from both the [Frontend API](https://clerk.com/docs/reference/frontend-api){{ target: '_blank' }} and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}, but can be set only from the Backend API.
   */
  publicMetadata: OrganizationMembershipPublicMetadata;
  /**
   * Public information about the user that this membership belongs to.
   */
  publicUserData?: PublicUserData;
  /**
   * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) of the member in the Organization.
   */
  role: OrganizationCustomRoleKey;
  /**
   * The name of the [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) of the member in the Organization.
   */
  roleName: string;
  /**
   * The date when the membership was created.
   */
  createdAt: Date;
  /**
   * The date when the membership was last updated.
   */
  updatedAt: Date;
  /**
   * Deletes the membership, removing the user from the Organization.
   *
   * @returns A promise that resolves to the deleted [`OrganizationMembership`](https://clerk.com/docs/reference/types/organization-membership) object.
   */
  destroy: () => Promise<OrganizationMembershipResource>;
  /**
   * Updates the member's [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) in the Organization.
   *
   * @param updateParams - The parameters containing the new Role to assign to the member.
   * @returns A promise that resolves to the updated [`OrganizationMembership`](https://clerk.com/docs/reference/types/organization-membership) object.
   */
  update: (updateParams: UpdateOrganizationMembershipParams) => Promise<OrganizationMembershipResource>;
  /**
   * @hidden
   */
  __internal_toSnapshot: () => OrganizationMembershipJSONSnapshot;
}

/**
 * `OrganizationCustomPermissionKey` is a type that represents a custom [Permission](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) in an Organization. It will be `string` unless the developer has provided their own types through [`ClerkAuthorization`](https://clerk.com/docs/guides/development/override-clerk-types-interfaces#example-custom-roles-and-permissions).
 *
 * @interface
 */
export type OrganizationCustomPermissionKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['permission'] extends string
    ? ClerkAuthorization['permission']
    : Base['permission']
  : Base['permission'];

/**
 * `OrganizationCustomRoleKey` is a type that represents the user's Role in an Organization. It will be string unless the developer has provided their own types through [`ClerkAuthorization`](https://clerk.com/docs/guides/development/override-clerk-types-interfaces#example-custom-roles-and-permissions).
 *
 * Clerk provides the [default Roles](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions#default-roles) `org:admin` and `org:member`. However, you can create [Custom Roles](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions#custom-roles) as well.
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
 * `OrganizationPermissionKey` is a combination of System and Custom Permissions.
 * System Permissions are only accessible from FAPI and client-side operations/utils
 */
export type OrganizationPermissionKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['permission'] extends string
    ? ClerkAuthorization['permission'] | OrganizationSystemPermissionKey
    : Autocomplete<OrganizationSystemPermissionKey>
  : Autocomplete<OrganizationSystemPermissionKey>;

/** @generateWithEmptyComment */
export type UpdateOrganizationMembershipParams = {
  /**
   * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) to assign to the member.
   */
  role: OrganizationCustomRoleKey;
};
