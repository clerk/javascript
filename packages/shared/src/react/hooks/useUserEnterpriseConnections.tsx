import { useCallback } from 'react';

import type { EnterpriseConnectionResource } from '../../types/enterpriseConnection';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useUserBase } from './base/useUserBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useUserEnterpriseConnectionsCacheKeys } from './useUserEnterpriseConnections.shared';

export type UseUserEnterpriseConnectionsParams = {
  enabled?: boolean;
  keepPreviousData?: boolean;
  withOrganizationAccountLinking?: boolean;
};

export type UseUserEnterpriseConnectionsReturn = {
  data: EnterpriseConnectionResource[] | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  revalidate: () => Promise<void>;
};

/**
 * Enterprise connections for the signed-in user
 *
 * @internal
 */
function useUserEnterpriseConnections(
  params: UseUserEnterpriseConnectionsParams = {},
): UseUserEnterpriseConnectionsReturn {
  const { keepPreviousData = true, enabled = true, withOrganizationAccountLinking = false } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, stableKey, authenticated } = useUserEnterpriseConnectionsCacheKeys({
    userId: user?.id ?? null,
    withOrganizationAccountLinking,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(user);

  useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

  const query = useClerkQuery({
    queryKey,
    queryFn: () => user?.getEnterpriseConnections({ withOrganizationAccountLinking }),
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [stableKey] }),
    [queryClient, stableKey],
  );

  return {
    data: query.data,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    revalidate,
  };
}

export { useUserEnterpriseConnections as __internal_useUserEnterpriseConnections };
