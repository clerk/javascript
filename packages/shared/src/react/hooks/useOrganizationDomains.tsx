import { useCallback, useEffect, useMemo } from 'react';

import { logger } from '../../logger';
import type { GetDomainsParams } from '../../types/organization';
import type {
  OrganizationDomainResource,
  OrganizationDomainsBulkOwnershipVerificationResource,
  OrganizationEnrollmentMode,
} from '../../types/organizationDomain';
import { useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useOrganizationDomainsCacheKeys } from './useOrganizationDomains.shared';

const OWNERSHIP_VERIFICATION_POLL_INTERVAL_MS = 10_000;

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
   * Issues a fresh TXT challenge for each of the given domains in a single
   * request. Each resolved domain's `ownershipVerification` carries the
   * `txtRecordName` and `txtRecordValue`.
   */
  prepareOwnershipVerification: (
    domains: OrganizationDomainResource[],
  ) => Promise<OrganizationDomainsBulkOwnershipVerificationResource | undefined>;
  /**
   * Resolves the published TXT records for the given domains to complete ownership verification.
   */
  attemptOwnershipVerification: (
    domains: OrganizationDomainResource[],
  ) => Promise<OrganizationDomainsBulkOwnershipVerificationResource | undefined>;
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
      let created = await organization?.createDomain(name, enrollmentMode ? { enrollmentMode } : undefined);

      if (created && enrollmentMode === 'enterprise_sso') {
        const prepared = await organization?.prepareOwnershipVerification([created.id]);
        created = prepared?.data[0] ?? created;
      }

      await revalidate();
      return created;
    },
    [organization, revalidate, enrollmentMode],
  );

  const prepareOwnershipVerification = useCallback(
    async (domains: OrganizationDomainResource[]) => {
      const prepared = await organization?.prepareOwnershipVerification(domains.map(domain => domain.id));
      await revalidate();
      return prepared;
    },
    [organization, revalidate],
  );

  const attemptOwnershipVerification = useCallback(
    async (domains: OrganizationDomainResource[]) => {
      const attempted = await organization?.attemptOwnershipVerification(domains.map(domain => domain.id));
      await revalidate();
      return attempted;
    },
    [organization, revalidate],
  );

  const response = query.data;

  const unverifiedOwnershipDomainIds = useMemo(
    () =>
      (response?.data ?? [])
        .filter(
          (domain: OrganizationDomainResource) =>
            domain.ownershipVerification && domain.ownershipVerification.status !== 'verified',
        )
        .map((domain: OrganizationDomainResource) => domain.id),
    [response?.data],
  );

  const unverifiedOwnershipKey = unverifiedOwnershipDomainIds.join(',');

  // Poll `attempt_ownership_verification` for the outstanding unverified domains
  // until none remain.
  useEffect(() => {
    if (!queryEnabled || !organization || !unverifiedOwnershipKey) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => void runAttempt(), OWNERSHIP_VERIFICATION_POLL_INTERVAL_MS);
    };

    const domainIds = unverifiedOwnershipKey.split(',');

    const runAttempt = async () => {
      const result = await organization.attemptOwnershipVerification(domainIds).catch((error: unknown) => {
        logger.warnOnce(`Clerk: failed to attempt organization domain ownership verification: ${error}`);
        return undefined;
      });
      if (cancelled) {
        return;
      }

      // Refetch the domains list after every attempt so the UI reflects the
      // latest ownership status
      await revalidate();
      if (cancelled) {
        return;
      }

      // Stop polling once every domain in the attempt response is verified
      const allVerified =
        !!result?.data.length && result.data.every(domain => domain.ownershipVerification?.status === 'verified');
      if (allVerified) {
        return;
      }

      scheduleNext();
    };

    scheduleNext();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unverifiedOwnershipKey, queryEnabled]);

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
