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
