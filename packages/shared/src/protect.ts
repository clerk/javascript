import type {
  __experimental_SessionVerificationLevel,
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';

const __internal_findFailedProtectConfiguration = <
  T extends ProtectConfiguration,
  AO extends {
    has: CheckAuthorizationWithCustomPermissions;
    userId: string | null | undefined;
  },
>(
  configs: T[],
  auth: AO,
): T | undefined => {
  const { has, userId } = auth;
  const finals = configs.map(config => {
    const { role, permission, reverification } = config as any;
    if (permission) {
      return has({ permission });
    }
    if (role) {
      return has({ role });
    }
    if (reverification) {
      return has({ __experimental_reverification: reverification });
    }

    return !!userId;
  });

  const failedItemIndex = finals.findIndex(a => a === false);
  if (failedItemIndex === -1) {
    return undefined;
  }

  return configs[failedItemIndex];
};

type ProtectConfiguration = {
  reverification?:
    | 'veryStrict'
    | 'strict'
    | 'moderate'
    | 'lax'
    | {
        level: __experimental_SessionVerificationLevel;
        afterMinutes: number;
      };
  permission?: OrganizationCustomPermissionKey;
  role?: OrganizationCustomRoleKey;
};

export { __internal_findFailedProtectConfiguration, type ProtectConfiguration };
