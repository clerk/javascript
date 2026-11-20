import {
  __internal_createCacheKeys,
  __internal_useClearQueriesOnSignOut,
  __internal_useClerkQuery,
  useOrganization,
} from '@clerk/shared/react';
import { useMemo } from 'react';

const ROLE_MEMBER_COUNTS_KEY = 'mosaic-organization-role-member-counts';

export function useOrganizationRoleMemberCountsQuery({ roleKeys, enabled }: { roleKeys: string[]; enabled: boolean }) {
  const { organization } = useOrganization();
  const organizationId = organization?.id;
  const keys = roleKeys.join(',');

  const { queryKey, stableKey, authenticated } = useMemo(
    () =>
      __internal_createCacheKeys({
        stablePrefix: ROLE_MEMBER_COUNTS_KEY,
        authenticated: true,
        tracked: { organizationId },
        untracked: { args: { keys } },
      }),
    [organizationId, keys],
  );

  __internal_useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  return __internal_useClerkQuery({
    queryKey,
    queryFn: async (): Promise<Record<string, number>> => {
      if (!organization) {
        return {};
      }
      const entries = await Promise.all(
        roleKeys.map(async role => {
          const { total_count } = await organization.getMemberships({ role: [role], pageSize: 1 });
          return [role, total_count] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: enabled && Boolean(organization) && roleKeys.length > 0,
  });
}
