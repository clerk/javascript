import { useCallback } from 'react';

import type {
  DirectorySyncGroupResource,
  DirectorySyncGroupRoleMappingResource,
  DirectorySyncResource,
  ReplaceDirectorySyncGroupRoleMappingsParams,
  RoleResource,
} from '../../types';
import { useClerkInstanceContext } from '../contexts';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationDirectorySyncGroupRoleMappingsCacheKeys } from './useOrganizationDirectorySync.shared';

const GROUPS_PAGE_SIZE = 500;

export type UseOrganizationDirectorySyncGroupRoleMappingsParams = {
  /** The directory to read, e.g. `data` from `useOrganizationDirectorySync`. Nothing is fetched while `null` or `undefined`. */
  directory: DirectorySyncResource | null | undefined;
  /**
   * If `false`, nothing is fetched.
   *
   * @default true
   */
  enabled?: boolean;
};

export type DirectorySyncGroupRoleMappingsData = {
  /** Every group the identity provider has pushed. */
  groups: DirectorySyncGroupResource[];
  /** The mappings in priority order. */
  mappings: DirectorySyncGroupRoleMappingResource[];
  /** The role members in no mapped group receive. */
  defaultRole: RoleResource | null;
};

export type UseOrganizationDirectorySyncGroupRoleMappingsReturn = {
  /** `undefined` while loading and while the hook is disabled. */
  data: DirectorySyncGroupRoleMappingsData | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  /** Replaces every mapping and caches the result. */
  replaceGroupRoleMappings: (
    params: ReplaceDirectorySyncGroupRoleMappingsParams,
  ) => Promise<DirectorySyncGroupRoleMappingResource[] | undefined>;
  revalidate: () => Promise<void>;
};

const fetchAllGroups = async (directory: DirectorySyncResource): Promise<DirectorySyncGroupResource[]> => {
  const groups: DirectorySyncGroupResource[] = [];
  let startingAfter: string | undefined;
  do {
    const page = await directory.getGroups({ limit: GROUPS_PAGE_SIZE, startingAfter });
    groups.push(...page.data);
    startingAfter = page.hasNextPage && page.startingAfter ? page.startingAfter : undefined;
  } while (startingAfter);
  return groups;
};

/**
 * The groups a Directory Sync directory has received, its group role mappings, and the organization's
 * default role, loaded together because the mapping editor needs all three.
 *
 * @internal
 */
function useOrganizationDirectorySyncGroupRoleMappings(
  params: UseOrganizationDirectorySyncGroupRoleMappingsParams,
): UseOrganizationDirectorySyncGroupRoleMappingsReturn {
  const { directory, enabled = true } = params;

  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, invalidationKey, stableKey, authenticated } =
    useOrganizationDirectorySyncGroupRoleMappingsCacheKeys({
      organizationId: organization?.id ?? null,
      enterpriseConnectionId: directory?.enterpriseConnectionId ?? null,
      directoryId: directory?.id ?? null,
    });

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const belongsToActiveOrganization = Boolean(organization) && directory?.organizationId === organization?.id;
  const queryEnabled = enabled && clerk.loaded && belongsToActiveOrganization && Boolean(directory);

  const query = useClerkQuery({
    queryKey,
    queryFn: async (): Promise<DirectorySyncGroupRoleMappingsData> => {
      if (!directory) {
        throw new Error('directory is required to fetch group role mappings');
      }
      const [groups, mappings] = await Promise.all([fetchAllGroups(directory), directory.getGroupRoleMappings()]);
      return { groups, mappings: mappings.data, defaultRole: mappings.defaultRole };
    },
    enabled: queryEnabled,
  });

  const revalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: invalidationKey });
  }, [queryClient, invalidationKey]);

  const replaceGroupRoleMappings = useCallback(
    async (replaceParams: ReplaceDirectorySyncGroupRoleMappingsParams) => {
      if (!directory) {
        return undefined;
      }
      const replaced = await directory.replaceGroupRoleMappings(replaceParams);
      queryClient.setQueryData<DirectorySyncGroupRoleMappingsData>(queryKey, previous =>
        previous ? { ...previous, mappings: replaced.data, defaultRole: replaced.defaultRole } : previous,
      );
      return replaced.data;
    },
    [directory, queryClient, queryKey],
  );

  return {
    data: queryEnabled ? query.data : undefined,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    replaceGroupRoleMappings,
    revalidate,
  };
}

export { useOrganizationDirectorySyncGroupRoleMappings as __internal_useOrganizationDirectorySyncGroupRoleMappings };
