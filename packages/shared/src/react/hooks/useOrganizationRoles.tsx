import { useCallback, useMemo } from 'react';

import { useClerkInstanceContext } from '../contexts';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useSessionBase } from './base/useSessionBase';
import { createCacheKeys } from './createCacheKeys';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';

function useOrganizationRoles({ enabled = true }: { enabled?: boolean } = {}) {
  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const session = useSessionBase();
  const [queryClient] = useClerkQueryClient();
  const keys = useMemo(
    () =>
      createCacheKeys({
        stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_ROLES_KEY,
        authenticated: Boolean(organization && session),
        tracked: { organizationId: organization?.id ?? null, sessionId: session?.id ?? null },
        untracked: { args: { pageSize: 20 } },
      }),
    [organization, session],
  );
  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated: true,
    stableKeys: keys.stableKey,
  });
  const query = useClerkQuery({
    queryKey: keys.queryKey,
    queryFn: () => organization?.getRoles({ pageSize: 20 }),
    enabled: enabled && clerk.loaded && Boolean(organization && session),
  });
  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [keys.stableKey] }),
    [queryClient, keys.stableKey],
  );

  return {
    data: enabled ? query.data?.data : undefined,
    hasRoleSetMigration: enabled ? (query.data?.has_role_set_migration ?? false) : false,
    error: enabled ? (query.error ?? null) : null,
    isLoading: enabled && query.isLoading,
    isFetching: enabled && query.isFetching,
    revalidate,
  };
}

export { useOrganizationRoles as __internal_useOrganizationRoles };
