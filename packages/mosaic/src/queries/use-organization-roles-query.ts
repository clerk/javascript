import {
  __internal_createCacheKeys,
  __internal_useClearQueriesOnSignOut,
  __internal_useClerkQuery,
  useOrganization,
} from '@clerk/shared/react';
import { useMemo } from 'react';

const ORGANIZATION_ROLES_KEY = 'mosaic-organization-roles';
const ROLES_PAGE_SIZE = 20;

export function useOrganizationRolesQuery({ enabled }: { enabled: boolean }) {
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  const { queryKey, stableKey, authenticated } = useMemo(
    () =>
      __internal_createCacheKeys({
        stablePrefix: ORGANIZATION_ROLES_KEY,
        authenticated: true,
        tracked: { organizationId },
        untracked: { args: { pageSize: ROLES_PAGE_SIZE } },
      }),
    [organizationId],
  );

  __internal_useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  return __internal_useClerkQuery({
    queryKey,
    queryFn: () => organization?.getRoles({ pageSize: ROLES_PAGE_SIZE }),
    staleTime: 2 * 60_000,
    retry: false,
    enabled: enabled && Boolean(organization),
  });
}
