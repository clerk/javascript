import { useCallback, useMemo } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import type { EnvironmentResource } from '../../types';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkQuery } from '../clerk-rq/useQuery';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import type { SubscriptionResult, UseSubscriptionParams } from './useSubscription.types';

const HOOK_NAME = 'useSubscription';

/**
 * @internal
 */
function KeepPreviousDataFn<Data>(previousData: Data): Data {
  return previousData;
}

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

  // @ts-expect-error `__unstable__environment` is not typed
  const environment = clerk.__unstable__environment as unknown as EnvironmentResource | null | undefined;

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

  const isOrganization = params?.for === 'organization';
  const billingEnabled = isOrganization
    ? environment?.commerceSettings.billing.organization.enabled
    : environment?.commerceSettings.billing.user.enabled;
  const keepPreviousData = params?.keepPreviousData ?? false;

  const [queryClient] = useClerkQueryClient();

  const queryKey = useMemo(() => {
    return [
      'commerce-subscription',
      {
        userId: user?.id,
        args: { orgId: isOrganization ? organization?.id : undefined },
      },
    ];
  }, [user?.id, isOrganization, organization?.id]);

  const queriesEnabled = Boolean(user?.id && billingEnabled) && (params?.enabled ?? true);

  const query = useClerkQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const obj = queryKey[1] as { args: { orgId?: string } };
      return clerk.billing.getSubscription(obj.args);
    },
    staleTime: 1_000 * 60,
    enabled: queriesEnabled,
    placeholderData: keepPreviousData && queriesEnabled ? KeepPreviousDataFn : undefined,
  });

  const revalidate = useCallback(() => queryClient.invalidateQueries({ queryKey }), [queryClient, queryKey]);

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
