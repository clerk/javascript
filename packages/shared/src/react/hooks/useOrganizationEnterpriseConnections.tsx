import { useCallback } from 'react';

import type { DeletedObjectResource } from '../../types/deletedObject';
import type {
  CreateOrganizationEnterpriseConnectionParams,
  EnterpriseConnectionResource,
  UpdateOrganizationEnterpriseConnectionParams,
} from '../../types/enterpriseConnection';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationEnterpriseConnectionsCacheKeys } from './useOrganizationEnterpriseConnections.shared';

export type UseOrganizationEnterpriseConnectionsParams = {
  enabled?: boolean;
  keepPreviousData?: boolean;
  withOrganizationAccountLinking?: boolean;
};

export type UseOrganizationEnterpriseConnectionsReturn = {
  data: EnterpriseConnectionResource[] | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  createEnterpriseConnection: (
    params: CreateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  updateEnterpriseConnection: (
    enterpriseConnectionId: string,
    params: UpdateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  deleteEnterpriseConnection: (enterpriseConnectionId: string) => Promise<DeletedObjectResource | undefined>;
  revalidate: () => Promise<void>;
};

/**
 * Enterprise connections for the active organization
 *
 * @internal
 */
function useOrganizationEnterpriseConnections(
  params: UseOrganizationEnterpriseConnectionsParams = {},
): UseOrganizationEnterpriseConnectionsReturn {
  const { keepPreviousData = true, enabled = true, withOrganizationAccountLinking = false } = params;
  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, stableKey, authenticated } = useOrganizationEnterpriseConnectionsCacheKeys({
    organizationId: organization?.id ?? null,
    withOrganizationAccountLinking,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(organization);

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const query = useClerkQuery({
    queryKey,
    queryFn: () => organization?.getEnterpriseConnections({ withOrganizationAccountLinking }),
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [stableKey] }),
    [queryClient, stableKey],
  );

  const createEnterpriseConnection = useCallback(
    async (createParams: CreateOrganizationEnterpriseConnectionParams) => {
      const created = await organization?.createEnterpriseConnection(createParams);
      await revalidate();
      return created;
    },
    [organization, revalidate],
  );

  const updateEnterpriseConnection = useCallback(
    async (enterpriseConnectionId: string, updateParams: UpdateOrganizationEnterpriseConnectionParams) => {
      const updated = await organization?.updateEnterpriseConnection(enterpriseConnectionId, updateParams);
      await revalidate();
      return updated;
    },
    [organization, revalidate],
  );

  const deleteEnterpriseConnection = useCallback(
    async (enterpriseConnectionId: string) => {
      const deleted = await organization?.deleteEnterpriseConnection(enterpriseConnectionId);
      await revalidate();
      return deleted;
    },
    [organization, revalidate],
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

export { useOrganizationEnterpriseConnections as __internal_useOrganizationEnterpriseConnections };
