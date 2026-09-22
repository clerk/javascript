import { useCallback } from 'react';

import type { DeletedObjectResource } from '../../types/deletedObject';
import type { AddSSOBypassAllowlistUserParams, SSOBypassAllowlistUserResource } from '../../types/ssoBypassAllowlist';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationSSOBypassAllowlistCacheKeys } from './useOrganizationSSOBypassAllowlist.shared';

export type UseOrganizationSSOBypassAllowlistParams = {
  enabled?: boolean;
  keepPreviousData?: boolean;
};

export type UseOrganizationSSOBypassAllowlistReturn = {
  data: SSOBypassAllowlistUserResource[] | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  addUser: (params: AddSSOBypassAllowlistUserParams) => Promise<SSOBypassAllowlistUserResource | undefined>;
  removeUser: (userId: string) => Promise<DeletedObjectResource | undefined>;
  revalidate: () => Promise<void>;
};

/**
 * The SSO bypass allowlist of the active organization
 *
 * @internal
 */
function useOrganizationSSOBypassAllowlist(
  params: UseOrganizationSSOBypassAllowlistParams = {},
): UseOrganizationSSOBypassAllowlistReturn {
  const { keepPreviousData = false, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, stableKey, authenticated } = useOrganizationSSOBypassAllowlistCacheKeys({
    organizationId: organization?.id ?? null,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(organization);

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const query = useClerkQuery({
    queryKey,
    queryFn: () => organization?.ssoBypassAllowlist.getUsers(),
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [stableKey] }),
    [queryClient, stableKey],
  );

  const addUser = useCallback(
    async (addParams: AddSSOBypassAllowlistUserParams) => {
      const added = await organization?.ssoBypassAllowlist.addUser(addParams);
      await revalidate();
      return added;
    },
    [organization, revalidate],
  );

  const removeUser = useCallback(
    async (userId: string) => {
      const removed = await organization?.ssoBypassAllowlist.removeUser(userId);
      await revalidate();
      return removed;
    },
    [organization, revalidate],
  );

  return {
    data: query.data,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    addUser,
    removeUser,
    revalidate,
  };
}

export { useOrganizationSSOBypassAllowlist as __internal_useOrganizationSSOBypassAllowlist };
