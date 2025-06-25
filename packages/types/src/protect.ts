import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';
import type { CheckAuthorizationWithCustomPermissions } from './session';
import type { Autocomplete } from './utils';

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
