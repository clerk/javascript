import type { EnterpriseAccountConnectionResource } from '../../types/enterpriseAccount';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useClerkInstanceContext } from '../contexts';
import { useUserBase } from './base/useUserBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useUserEnterpriseConnectionsCacheKeys } from './useUserEnterpriseConnections.shared';

export type UseUserEnterpriseConnectionsParams = {
  enabled?: boolean;
  keepPreviousData?: boolean;
  withOrganizationAccountLinking?: boolean;
};

export type UseUserEnterpriseConnectionsReturn = {
  data: EnterpriseAccountConnectionResource[] | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
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

  return {
    data: query.data,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

export { useUserEnterpriseConnections as __internal_useUserEnterpriseConnections };
