import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';
import type { CheckAuthorizationWithCustomPermissions, PendingSessionOptions } from './session';
import type { Autocomplete } from './utils';

/**
 * Authorization parameters used by `auth.protect()`.
 *
 * Use `ProtectParams` to specify the required role, permission, feature, or plan for access.
 */
export type ProtectParams =
  | {
      condition?: never;
      feature?: never;
      permission?: never;
      plan?: never;
      role: OrganizationCustomRoleKey;
    }
  | {
      condition?: never;
      feature?: never;
      permission: OrganizationCustomPermissionKey;
      plan?: never;
      role?: never;
    }
  | {
      condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
      feature?: never;
      permission?: never;
      plan?: never;
      role?: never;
    }
  | {
      condition?: never;
      feature: Autocomplete<`user:${string}` | `org:${string}`>;
      permission?: never;
      plan?: never;
      role?: never;
    }
  | {
      condition?: never;
      feature?: never;
      permission?: never;
      plan: Autocomplete<`user:${string}` | `org:${string}`>;
      role?: never;
    };

/**
 * Authorization condition for the `when` prop in `<Show />`.
 * Can be an object specifying role, permission, feature, or plan,
 * or a callback function receiving the `has` helper for complex conditions.
 */
export type ShowWhenCondition =
  | 'signed-in'
  | 'signed-out'
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
 */
export type ShowProps = PendingSessionOptions & {
  fallback?: unknown;
  when: ShowWhenCondition;
};
