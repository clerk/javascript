import { useCallback } from 'react';

import type { GetDomainsParams } from '../../types/organization';
import type { OrganizationDomainResource, OrganizationEnrollmentMode } from '../../types/organizationDomain';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationDomainsCacheKeys } from './useOrganizationDomains.shared';

export type UseOrganizationDomainsParams = {
  enabled?: boolean;
  keepPreviousData?: boolean;
  /**
   * Filter the returned domains by enrollment mode.
   */
  enrollmentMode?: OrganizationEnrollmentMode;
};

export type UseOrganizationDomainsReturn = {
  data: OrganizationDomainResource[] | undefined;
  totalCount: number | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  /**
   * Creates a new domain for the active organization, derived from the given name.
   */
  createDomain: (name: string) => Promise<OrganizationDomainResource | undefined>;
  /**
   * Issues a fresh TXT challenge for the given domain. The resolved domain's
   * `ownershipVerification` carries the `txtRecordName` and `txtRecordValue`.
   */
  prepareOwnershipVerification: (domain: OrganizationDomainResource) => Promise<OrganizationDomainResource | undefined>;
  /**
   * Resolves the published TXT record for the given domain to complete ownership verification.
   */
  attemptOwnershipVerification: (domain: OrganizationDomainResource) => Promise<OrganizationDomainResource | undefined>;
  revalidate: () => Promise<void>;
};

/**
 * Domains for the active organization.
 *
 * @internal
 */
function useOrganizationDomains(params: UseOrganizationDomainsParams = {}): UseOrganizationDomainsReturn {
  const { keepPreviousData = true, enabled = true, enrollmentMode } = params;
  const clerk = useClerkInstanceContext();
  const organization = useOrganizationBase();
  const [queryClient] = useClerkQueryClient();

  const { queryKey, stableKey, authenticated } = useOrganizationDomainsCacheKeys({
    organizationId: organization?.id ?? null,
    enrollmentMode,
  });

  const queryEnabled = enabled && clerk.loaded && Boolean(organization);

  useClearQueriesOnSignOut({
    isSignedOut: organization === null,
    authenticated,
    stableKeys: stableKey,
  });

  const fetchParams: GetDomainsParams | undefined = enrollmentMode ? { enrollmentMode } : undefined;

  const query = useClerkQuery({
    queryKey,
    queryFn: () => organization?.getDomains(fetchParams),
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [stableKey] }),
    [queryClient, stableKey],
  );

  const createDomain = useCallback(
    async (name: string) => {
      const created = await organization?.createDomain(name);
      await revalidate();
      return created;
    },
    [organization, revalidate],
  );

  const prepareOwnershipVerification = useCallback(
    async (domain: OrganizationDomainResource) => {
      const prepared = await domain.prepareOwnershipVerification();
      await revalidate();
      return prepared;
    },
    [revalidate],
  );

  const attemptOwnershipVerification = useCallback(
    async (domain: OrganizationDomainResource) => {
      const attempted = await domain.attemptOwnershipVerification();
      await revalidate();
      return attempted;
    },
    [revalidate],
  );

  const response = query.data;

  return {
    data: response?.data,
    totalCount: response?.total_count,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    createDomain,
    prepareOwnershipVerification,
    attemptOwnershipVerification,
    revalidate,
  };
}

export { useOrganizationDomains as __internal_useOrganizationDomains };
