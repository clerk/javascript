import { useCallback } from 'react';

import type {
  DirectorySyncResource,
  DirectorySyncUserResource,
  GetDirectorySyncUsersParams,
} from '../../types/directorySync';
import { useClerkInstanceContext } from '../contexts';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationDirectorySyncUsersCacheKeys } from './useOrganizationDirectorySync.shared';

const DEFAULT_POLL_INTERVAL_MS = 2_000;

export type UseOrganizationDirectorySyncUsersParams = {
  /** The directory to list users for, e.g. `data` from `useOrganizationDirectorySync`. Nothing is fetched while `null` or `undefined`. */
  directory: DirectorySyncResource | null | undefined;
  /**
   * Pass-through fetch parameters (pagination).
   * Defaults to `{ initialPage: 1, pageSize: 10 }`.
   */
  params?: GetDirectorySyncUsersParams;
  /**
   * Poll the list for changes while `true`. Tie this to the view that needs the
   * live feed so polling stops when that view goes away.
   *
   * @default false
   */
  poll?: boolean;
  /**
   * Polling interval (ms) used while `poll` is `true`.
   *
   * @default 2000
   */
  pollIntervalMs?: number;
  /**
   * If `false`, nothing is fetched and polling is paused.
   *
   * @default true
   */
  enabled?: boolean;
  keepPreviousData?: boolean;
};

export type UseOrganizationDirectorySyncUsersReturn = {
  /** `undefined` while loading and while the hook is disabled. */
  data: DirectorySyncUserResource[] | undefined;
  totalCount: number | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  /** `true` while the hook is polling. */
  isPolling: boolean;
  /**
   * Force a refetch.
   */
  revalidate: () => Promise<void>;
};

/**
 * The users provisioned into an enterprise connection's Directory Sync
 * directory, most recently touched first. Polling is opt-in via `poll`, which
 * lets the setup flow use the list as a live activity feed.
 *
 * @internal
 */
function useOrganizationDirectorySyncUsers(
  params: UseOrganizationDirectorySyncUsersParams,
): UseOrganizationDirectorySyncUsersReturn {
  const {
    directory,
    params: fetchParams = { initialPage: 1, pageSize: 10 },
    poll = false,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    enabled = true,
    keepPreviousData = true,
  } = params;

  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();
  const enterpriseConnectionId = directory?.enterpriseConnectionId ?? null;
  const directoryId = directory?.id ?? null;

  const { queryKey, invalidationKey, stableKey, authenticated } = useOrganizationDirectorySyncUsersCacheKeys({
    organizationId: organization?.id ?? null,
    enterpriseConnectionId,
    directoryId,
    args: fetchParams,
  });

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(organization) && Boolean(directory);

  const currentTracked = queryKey[2];
  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!directory) {
        throw new Error('directory is required to fetch directory users');
      }
      return directory.getUsers(fetchParams);
    },
    refetchInterval: () => (poll ? pollIntervalMs : false),
    enabled: queryEnabled,
    refetchIntervalInBackground: false,
    // Carry previous data only across pagination within the same organization
    // and directory — never across an identity change, where stale rows would
    // leak into the new context.
    placeholderData: keepPreviousData
      ? (previousData, previousQuery) => {
          const previousTracked = previousQuery?.queryKey[2];
          const sameIdentity =
            Boolean(currentTracked.organizationId) &&
            Boolean(currentTracked.directoryId) &&
            previousTracked?.organizationId === currentTracked.organizationId &&
            previousTracked?.directoryId === currentTracked.directoryId;
          return sameIdentity ? previousData : undefined;
        }
      : undefined,
  });

  const revalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: invalidationKey });
  }, [queryClient, invalidationKey]);

  const isPolling = queryEnabled && poll;

  return {
    // A disabled query still exposes rows cached under its key; report none until it can run.
    data: queryEnabled ? query.data?.data : undefined,
    totalCount: queryEnabled ? query.data?.total_count : undefined,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling,
    revalidate,
  };
}

export { useOrganizationDirectorySyncUsers as __internal_useOrganizationDirectorySyncUsers };
