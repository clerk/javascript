import { useCallback } from 'react';

import type { DeletedObjectResource } from '../../types/deletedObject';
import type {
  AddSsoBypassAllowlistUserParams,
  SsoBypassAllowlistUserResource,
} from '../../types/ssoBypassAllowlistUser';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationSsoBypassAllowlistCacheKeys } from './useOrganizationSsoBypassAllowlist.shared';

export type UseOrganizationSsoBypassAllowlistParams = {
  enabled?: boolean;
  keepPreviousData?: boolean;
};

export type UseOrganizationSsoBypassAllowlistReturn = {
  data: SsoBypassAllowlistUserResource[] | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  addUser: (params: AddSsoBypassAllowlistUserParams) => Promise<SsoBypassAllowlistUserResource | undefined>;
  removeUser: (userId: string) => Promise<DeletedObjectResource | undefined>;
  revalidate: () => Promise<void>;
};

/**
 * The SSO bypass allowlist of the active organization
 *
 * @internal
 */
function useOrganizationSsoBypassAllowlist(
  params: UseOrganizationSsoBypassAllowlistParams = {},
): UseOrganizationSsoBypassAllowlistReturn {
  const { keepPreviousData = true, enabled = true } = params;
  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, stableKey, authenticated } = useOrganizationSsoBypassAllowlistCacheKeys({
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
    queryFn: () => organization?.getSsoBypassAllowlistUsers(),
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [stableKey] }),
    [queryClient, stableKey],
  );

  const addUser = useCallback(
    async (addParams: AddSsoBypassAllowlistUserParams) => {
      const added = await organization?.addSsoBypassAllowlistUser(addParams);
      await revalidate();
      return added;
    },
    [organization, revalidate],
  );

  const removeUser = useCallback(
    async (userId: string) => {
      const removed = await organization?.removeSsoBypassAllowlistUser(userId);
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

export { useOrganizationSsoBypassAllowlist as __internal_useOrganizationSsoBypassAllowlist };
