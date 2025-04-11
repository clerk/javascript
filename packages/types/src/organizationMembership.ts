import type { OrganizationResource } from './organization';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';
import type { OrganizationMembershipJSONSnapshot } from './snapshots';
import type { Autocomplete } from './utils';

interface Base {
  permission: string;
  role: string;
  feature: string;
  plan: string;
}

interface Placeholder {
  permission: unknown;
  role: unknown;
  feature: unknown;
  plan: unknown;
}

// interface StructuredClerkAuthorization {
//   permission?: `org:${string}`;
//   role?: `org:${string}`;
//   feature: `org:${string}` | `user:${string}`;
//   plan: `org:${string}` | `user:${string}`;
// }

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

export interface OrganizationMembershipResource extends ClerkResource {
  id: string;
  organization: OrganizationResource;
  permissions: OrganizationPermissionKey[];
  publicMetadata: OrganizationMembershipPublicMetadata;
  publicUserData: PublicUserData;
  role: OrganizationCustomRoleKey;
  createdAt: Date;
  updatedAt: Date;
  destroy: () => Promise<OrganizationMembershipResource>;
  update: (updateParams: UpdateOrganizationMembershipParams) => Promise<OrganizationMembershipResource>;
  __internal_toSnapshot: () => OrganizationMembershipJSONSnapshot;
}

export type OrganizationCustomPermissionKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['permission'] extends string
    ? ClerkAuthorization['permission']
    : Base['permission']
  : Base['permission'];

/**
 * `OrganizationCustomRoleKey` is a type that represents the user's role in an organization. It will be string unless the developer has provided their own types through [`ClerkAuthorization`](https://clerk.com/docs/guides/custom-types#example-custom-roles-and-permissions).
 *
 * Clerk provides the [default roles](https://clerk.com/docs/organizations/roles-permissions#default-roles) `org:admin` and `org:member`. However, you can create [custom roles](https://clerk.com/docs/organizations/create-roles-permissions) as well.
 *
 * @interface
 */
export type OrganizationCustomRoleKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['role'] extends string
    ? ClerkAuthorization['role']
    : Base['role']
  : Base['role'];

// type ExtractAfterPrefix<T extends string, P extends string> = T extends `${P}${infer Rest}` ? Rest : never;

// type Util<T extends string> = T | ExtractAfterPrefix<T, 'user:'> | ExtractAfterPrefix<T, 'org:'>;

// type ExtractAfterPrefix<T extends string, P extends string> = T extends `${P}${infer Rest}` ? Rest : never;

// type DistributeUnion<T extends string> = T extends any ? T : never;

// type Util<T extends string> = DistributeUnion<T | ExtractAfterPrefix<T, "user:"> | ExtractAfterPrefix<T, "org:">>;
//
// type Util<T extends string> = T | ExtractAfterPrefix<T, 'user:'> | ExtractAfterPrefix<T, 'org:'>;
//
// type InternalClerkCustomFeatureKey = ClerkAuthorization['feature']

// type ExtractAfterPrefix<T extends string, P extends string> = T extends `${P}${infer Rest}` ? Rest : never;

// type Util<T extends string> = T | ExtractAfterPrefix<T, 'user:'> | ExtractAfterPrefix<T, 'org:'>;

// type InternalClerkCustomFeatureKey = Util<ClerkAuthorization['feature']>;

type ValidPrefix = 'user:' | 'org:';
type ValidFeaturePattern = `${ValidPrefix}${string}`;

type ExtractAfterPrefix<T extends string, P extends string> = T extends `${P}${infer Rest}` ? Rest : never;

type Util<T extends string> = T extends ValidFeaturePattern
  ? T | ExtractAfterPrefix<T, 'user:'> | ExtractAfterPrefix<T, 'org:'>
  : `Expected format: "user:<string>" | "org:<string>", but got "${T}"`;

interface FakeClerkAuthorization {
  // @ts-ignore
  feature: Util<ClerkAuthorization['feature']>;
  // @ts-ignore
  plan: Util<ClerkAuthorization['plan']>;
}

export type ClerkCustomFeatureKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['feature'] extends string
    ? FakeClerkAuthorization['feature']
    : Util<Base['feature']>
  : Util<Base['feature']>;

export type ClerkCustomPlanKey = ClerkAuthorization extends Placeholder
  ? ClerkAuthorization['plan'] extends string
    ? FakeClerkAuthorization['plan']
    : Util<Base['plan']>
  : Util<Base['plan']>;

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
