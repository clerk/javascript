import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';
import type { CheckAuthorizationWithCustomPermissions, PendingSessionOptions } from './session';
import type { Autocomplete } from './utils';

type RoleProtectParams = {
  condition?: never;
  feature?: never;
  permission?: never;
  plan?: never;
  role: OrganizationCustomRoleKey;
};

type PermissionProtectParams = {
  condition?: never;
  feature?: never;
  permission: OrganizationCustomPermissionKey;
  plan?: never;
  role?: never;
};

type ConditionProtectParams = {
  condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
  feature?: never;
  permission?: never;
  plan?: never;
  role?: never;
};

type FeatureProtectParams = {
  condition?: never;
  feature: Autocomplete<`user:${string}` | `org:${string}`>;
  permission?: never;
  plan?: never;
  role?: never;
};

type PlanProtectParams = {
  condition?: never;
  feature?: never;
  permission?: never;
  plan: Autocomplete<`user:${string}` | `org:${string}`>;
  role?: never;
};

/**
 * Authorization parameters used by `auth.protect()`.
 *
 * Use `ProtectParams` to specify the required role, permission, feature, or plan for access.
 */
export type ProtectParams =
  | ConditionProtectParams
  | FeatureProtectParams
  | PermissionProtectParams
  | PlanProtectParams
  | RoleProtectParams;

/**
 * Authorization parameters for `<Show />` component.
 * Excludes `condition` since `Show` expects functions to be passed directly to `when`.
 */
type ShowProtectParams = FeatureProtectParams | PermissionProtectParams | PlanProtectParams | RoleProtectParams;

/**
 * Authorization condition for the `when` prop in `<Show />`.
 * Can be an object specifying role, permission, feature, or plan,
 * or a callback function receiving the `has` helper for complex conditions.
 *
 * Note: Unlike `ProtectParams`, this excludes the `condition` variant since
 * `<Show />` expects functions to be passed directly to `when`, not wrapped
 * in `{ condition: fn }`.
 */
export type ShowWhenCondition =
  | 'signed-in'
  | 'signed-out'
  | ShowProtectParams
  | ((has: CheckAuthorizationWithCustomPermissions) => boolean);

/**
 * Props for the `<Show />` component, which conditionally renders children based on authorization.
 *
 * @example
 * ```tsx
 * // Require a specific permission
 * <Show when={{ permission: "org:billing:manage" }}>...</Show>
 *
 * // Require a specific role
 * <Show when={{ role: "admin" }}>...</Show>
 *
 * // Use a custom condition callback
 * <Show when={(has) => has({ permission: "org:read" }) && someCondition}>...</Show>
 *
 * // Require a specific feature
 * <Show when={{ feature: "user:premium" }}>...</Show>
 *
 * // Require a specific plan
 * <Show when={{ plan: "pro" }}>...</Show>
 * ```
 */
export type ShowProps = PendingSessionOptions & {
  fallback?: unknown;
  when: ShowWhenCondition;
};
