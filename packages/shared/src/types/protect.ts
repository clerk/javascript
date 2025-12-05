import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';
import type { CheckAuthorizationWithCustomPermissions } from './session';
import type { Autocomplete } from './utils';

/**
 * Props for the `<Protect />` component, which restricts access to its children based on authentication and authorization.
 *
 * Use `ProtectProps` to specify the required role, permission, feature, or plan for access.
 *
 * @example
 * ```tsx
 * // Require a specific permission
 * <Protect permission="a_permission_key" />
 *
 * // Require a specific role
 * <Protect role="a_role_key" />
 *
 * // Use a custom condition callback
 * <Protect condition={(has) => has({ permission: "a_permission_key" })} />
 *
 * // Require a specific feature
 * <Protect feature="a_feature_key" />
 *
 * // Require a specific plan
 * <Protect plan=a_plan_key" />
 * ```
 */
export type ProtectProps =
  | {
      condition?: never;
      role: OrganizationCustomRoleKey;
      permission?: never;
      feature?: never;
      plan?: never;
    }
  | {
      condition?: never;
      role?: never;
      feature?: never;
      plan?: never;
      permission: OrganizationCustomPermissionKey;
    }
  | {
      condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
      role?: never;
      permission?: never;
      feature?: never;
      plan?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
      feature: Autocomplete<`user:${string}` | `org:${string}`>;
      plan?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
      feature?: never;
      plan: Autocomplete<`user:${string}` | `org:${string}`>;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
      feature?: never;
      plan?: never;
    };

/**
 * Authorization condition for the `when` prop in `<Show />`.
 * Can be an object specifying role, permission, feature, or plan,
 * or a callback function receiving the `has` helper for complex conditions.
 */
export type ShowWhenCondition =
  | { role: OrganizationCustomRoleKey }
  | { permission: OrganizationCustomPermissionKey }
  | { feature: Autocomplete<`org:${string}` | `user:${string}`> }
  | { plan: Autocomplete<`org:${string}` | `user:${string}`> }
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
export type ShowProps = {
  when: ShowWhenCondition;
};
