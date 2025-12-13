import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';
import type { CheckAuthorizationWithCustomPermissions, PendingSessionOptions } from './session';
import type { Autocomplete } from './utils';

/**
 * Authorization parameters used by `<Protect />` and `auth.protect()`.
 *
 * Use `ProtectParams` to specify the required role, permission, feature, or plan for access.
 *
 * @example
 * ```tsx
 * // Require a specific Permission
 * <Protect permission="a_permission_key" />
 *
 * // Require a specific Role
 * <Protect role="a_role_key" />
 *
 * // Use a custom condition callback
 * <Protect condition={(has) => has({ permission: "a_permission_key" })} />
 *
 * // Require a specific Feature
 * <Protect feature="a_feature_key" />
 *
 * // Require a specific plan
 * <Protect plan="a_plan_key" />
 * ```
 */
export type ProtectParams =
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
 * @deprecated Use {@link ProtectParams} instead.
 */
export type ProtectProps = ProtectParams;

/**
 * Authorization condition for the `when` prop in `<Show />`.
 * Can be an object specifying role, permission, feature, or plan,
 * or a callback function receiving the `has` helper for complex conditions.
 */
export type ShowWhenCondition =
  | 'signedIn'
  | 'signedOut'
  | ProtectParams
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
 *
 */
export type ShowProps = PendingSessionOptions & {
  fallback?: unknown;
  when: ShowWhenCondition;
};
