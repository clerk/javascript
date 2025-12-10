import { useCallback } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkQuery } from '../clerk-rq/useQuery';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import { useBillingHookEnabled } from './useBillingHookEnabled';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { useSubscriptionCacheKeys } from './useSubscription.shared';
import type { SubscriptionResult, UseSubscriptionParams } from './useSubscription.types';

const HOOK_NAME = 'useSubscription';

/**
 * This is the new implementation of useSubscription using React Query.
 * It is exported only if the package is build with the `CLERK_USE_RQ` environment variable set to `true`.
 *
 * @internal
 */
export function useSubscription(params?: UseSubscriptionParams): SubscriptionResult {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  const billingEnabled = useBillingHookEnabled(params);

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

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
    // Our existing types for SWR return undefined when there is no error, but React Query returns null.
    // So we need to convert the error to undefined, for backwards compatibility.
    error: query.error ?? undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    revalidate,
  };
}
