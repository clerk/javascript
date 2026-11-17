import type { ClerkAPIResponseError } from '../../error';
import type { ClerkPaginationParams, OrganizationAccessPolicyResource } from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { STABLE_KEYS } from '../stable-keys';
import type { PaginatedHookConfig, PaginatedResources } from '../types';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useUserBase } from './base/useUserBase';
import { createCacheKeys } from './createCacheKeys';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

export type UseOrganizationAccessPoliciesParams = PaginatedHookConfig<ClerkPaginationParams & { enabled?: boolean }>;

export type UseOrganizationAccessPoliciesReturn<T extends UseOrganizationAccessPoliciesParams> = PaginatedResources<
  OrganizationAccessPolicyResource,
  T extends { infinite: true } ? true : false
>;

export type UseOrganizationAccessPolicyParams = { policyId: string | null | undefined; enabled?: boolean };

export type UseOrganizationAccessPolicyReturn = {
  data: OrganizationAccessPolicyResource | undefined;
  error: ClerkAPIResponseError | null;
  isLoading: boolean;
  isFetching: boolean;
  revalidate: () => Promise<void>;
};

export function useOrganizationAccessPolicies<T extends UseOrganizationAccessPoliciesParams>(
  params?: T,
): UseOrganizationAccessPoliciesReturn<T> {
  useAssertWrappedByClerkProvider('useOrganizationAccessPolicies');
  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const user = useUserBase();
  const config = useWithSafeValues(params, {
    initialPage: 1,
    pageSize: 10,
    infinite: false,
    keepPreviousData: false,
    enabled: true,
  } as UseOrganizationAccessPoliciesParams);
  const { initialPage, pageSize } = config;

  return usePagesOrInfinite({
    keepPreviousDataWithinScope: true,
    fetcher: typeof organization?.getAccessPolicies === 'function' ? organization.getAccessPolicies : undefined,
    config: {
      ...config,
      enabled: (config.enabled ?? true) && clerk.loaded && Boolean(organization && user),
      isSignedIn: user !== null,
    },
    keys: createCacheKeys({
      stablePrefix: STABLE_KEYS.ORGANIZATION_ACCESS_POLICIES_KEY,
      authenticated: true,
      tracked: { organizationId: organization?.id, userId: user?.id },
      untracked: { args: { initialPage, pageSize } },
    }),
  }) as UseOrganizationAccessPoliciesReturn<T>;
}

export function __internal_organizationAccessPolicyCacheKeys(
  organizationId: string | undefined,
  userId: string | undefined,
  policyId?: string,
) {
  return createCacheKeys({
    stablePrefix: STABLE_KEYS.ORGANIZATION_ACCESS_POLICY_KEY,
    authenticated: true,
    tracked: { organizationId, userId },
    untracked: { args: { policyId } },
  });
}

export function useOrganizationAccessPolicy({
  policyId,
  enabled = true,
}: UseOrganizationAccessPolicyParams): UseOrganizationAccessPolicyReturn {
  useAssertWrappedByClerkProvider('useOrganizationAccessPolicy');
  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const user = useUserBase();
  const [queryClient] = useClerkQueryClient();
  const { queryKey, stableKey, authenticated } = __internal_organizationAccessPolicyCacheKeys(
    organization?.id,
    user?.id,
    policyId ?? undefined,
  );
  const canFetch = Boolean(policyId && user) && typeof organization?.getAccessPolicy === 'function' && clerk.loaded;

  useClearQueriesOnSignOut({ isSignedOut: user === null, stableKeys: stableKey, authenticated });

  const query = useClerkQuery({
    queryKey,
    queryFn: canFetch && policyId && organization ? () => organization.getAccessPolicy({ policyId }) : undefined,
    enabled: enabled && canFetch,
    staleTime: 60_000,
  });

  return {
    data: query.data,
    error: (query.error ?? null) as ClerkAPIResponseError | null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    revalidate: () => queryClient.invalidateQueries({ queryKey, exact: true }),
  };
}
