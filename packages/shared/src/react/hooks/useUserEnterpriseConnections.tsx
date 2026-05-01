import { useCallback } from 'react';

import type { DeletedObjectResource } from '../../types/deletedObject';
import type {
  CreateMeEnterpriseConnectionParams,
  EnterpriseConnectionResource,
  UpdateMeEnterpriseConnectionParams,
} from '../../types/enterpriseConnection';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
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
  data: EnterpriseConnectionResource[] | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  createEnterpriseConnection: (
    params: CreateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  updateEnterpriseConnection: (
    enterpriseConnectionId: string,
    params: UpdateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  deleteEnterpriseConnection: (enterpriseConnectionId: string) => Promise<DeletedObjectResource | undefined>;
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

  const createEnterpriseConnection = useCallback(
    async (createParams: CreateMeEnterpriseConnectionParams) => {
      const created = await user?.createEnterpriseConnection(createParams);
      await revalidate();
      return created;
    },
    [user, revalidate],
  );

  const updateEnterpriseConnection = useCallback(
    async (enterpriseConnectionId: string, updateParams: UpdateMeEnterpriseConnectionParams) => {
      const updated = await user?.updateEnterpriseConnection(enterpriseConnectionId, updateParams);
      await revalidate();
      return updated;
    },
    [user, revalidate],
  );

  const deleteEnterpriseConnection = useCallback(
    async (enterpriseConnectionId: string) => {
      const deleted = await user?.deleteEnterpriseConnection(enterpriseConnectionId);
      await revalidate();
      return deleted;
    },
    [user, revalidate],
  );

  return {
    data: query.data,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
    revalidate,
  };
}

export { useUserEnterpriseConnections as __internal_useUserEnterpriseConnections };
