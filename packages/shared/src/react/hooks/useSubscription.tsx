import { useCallback, useEffect, useRef } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useUserBase } from './base/useUserBase';
import { useBillingIsEnabled } from './useBillingIsEnabled';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useSubscriptionCacheKeys } from './useSubscription.shared';
import type { SubscriptionResult, UseSubscriptionParams } from './useSubscription.types';

const HOOK_NAME = 'useSubscription';

/**
 * @internal
 */
export function useSubscription(params?: UseSubscriptionParams): SubscriptionResult {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const clerk = useClerkInstanceContext();
  const user = useUserBase();
  const organization = useOrganizationBase();

  const billingEnabled = useBillingIsEnabled(params);

  const recordedRef = useRef(false);
  useEffect(() => {
    if (!recordedRef.current && clerk?.telemetry) {
      clerk.telemetry.record(eventMethodCalled(HOOK_NAME));
      recordedRef.current = true;
    }
  }, [clerk]);

  const keepPreviousData = params?.keepPreviousData ?? false;

  const [queryClient] = useClerkQueryClient();

  const { queryKey, invalidationKey, stableKey, authenticated } = useSubscriptionCacheKeys({
    userId: user?.id,
    orgId: organization?.id,
    for: params?.for,
  });

  const queriesEnabled = Boolean(user?.id && billingEnabled);
  useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

  const query = useClerkQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const obj = queryKey[3];
      return clerk.billing.getSubscription(obj.args);
    },
    staleTime: 1_000 * 60,
    enabled: queriesEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData && queriesEnabled),
  });

  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: invalidationKey }),
    [queryClient, invalidationKey],
  );

  return {
    data: query.data,
    // React Query returns null for no error, but our types expect undefined.
    // Convert to undefined for type compatibility.
    error: query.error ?? undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    revalidate,
  };
}
