import { useCallback } from 'react';

import { isClerkAPIResponseError } from '../../error';
import type { DeletedObjectResource } from '../../types/deletedObject';
import type {
  CreateDirectorySyncParams,
  DirectorySyncResource,
  UpdateDirectorySyncParams,
} from '../../types/directorySync';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationDirectorySyncCacheKeys } from './useOrganizationDirectorySync.shared';

export type UseOrganizationDirectorySyncParams = {
  enterpriseConnectionId: string | null;
  enabled?: boolean;
  keepPreviousData?: boolean;
};

export type UseOrganizationDirectorySyncReturn = {
  /**
   * The connection's directory, `null` when none has been created yet, `undefined` while loading.
   * Never carries the bearer token — that only exists on the resources resolved by
   * `createDirectorySync` and `rotateDirectorySyncToken`.
   */
  data: DirectorySyncResource | null | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  createDirectorySync: (params?: CreateDirectorySyncParams) => Promise<DirectorySyncResource | undefined>;
  updateDirectorySync: (params: UpdateDirectorySyncParams) => Promise<DirectorySyncResource | undefined>;
  rotateDirectorySyncToken: () => Promise<DirectorySyncResource | undefined>;
  deleteDirectorySync: () => Promise<DeletedObjectResource | undefined>;
  revalidate: () => Promise<void>;
};

/**
 * The Directory Sync directory bound to an enterprise connection of the active organization.
 *
 * @internal
 */
function useOrganizationDirectorySync(params: UseOrganizationDirectorySyncParams): UseOrganizationDirectorySyncReturn {
  const { enterpriseConnectionId, enabled = true, keepPreviousData = true } = params;
  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, stableKey, authenticated } = useOrganizationDirectorySyncCacheKeys({
    organizationId: organization?.id ?? null,
    enterpriseConnectionId,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(organization) && Boolean(enterpriseConnectionId);

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const query = useClerkQuery({
    queryKey,
    queryFn: async () => {
      if (!enterpriseConnectionId) {
        throw new Error('enterpriseConnectionId is required to fetch the directory');
      }
      try {
        return (await organization?.getDirectorySync(enterpriseConnectionId)) ?? null;
      } catch (err) {
        // No directory yet is a first-class state of the setup flow, not an error.
        if (isClerkAPIResponseError(err) && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [stableKey] }),
    [queryClient, stableKey],
  );

  const createDirectorySync = useCallback(
    async (createParams?: CreateDirectorySyncParams) => {
      if (!enterpriseConnectionId) {
        return undefined;
      }
      const created = await organization?.createDirectorySync(enterpriseConnectionId, createParams);
      await revalidate();
      return created;
    },
    [organization, enterpriseConnectionId, revalidate],
  );

  const updateDirectorySync = useCallback(
    async (updateParams: UpdateDirectorySyncParams) => {
      if (!enterpriseConnectionId) {
        return undefined;
      }
      const updated = await organization?.updateDirectorySync(enterpriseConnectionId, updateParams);
      await revalidate();
      return updated;
    },
    [organization, enterpriseConnectionId, revalidate],
  );

  const rotateDirectorySyncToken = useCallback(async () => {
    if (!enterpriseConnectionId) {
      return undefined;
    }
    const rotated = await organization?.rotateDirectorySyncToken(enterpriseConnectionId);
    await revalidate();
    return rotated;
  }, [organization, enterpriseConnectionId, revalidate]);

  const deleteDirectorySync = useCallback(async () => {
    if (!enterpriseConnectionId) {
      return undefined;
    }
    const deleted = await organization?.deleteDirectorySync(enterpriseConnectionId);
    await revalidate();
    return deleted;
  }, [organization, enterpriseConnectionId, revalidate]);

  return {
    data: query.data,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    createDirectorySync,
    updateDirectorySync,
    rotateDirectorySyncToken,
    deleteDirectorySync,
    revalidate,
  };
}

export { useOrganizationDirectorySync as __internal_useOrganizationDirectorySync };
