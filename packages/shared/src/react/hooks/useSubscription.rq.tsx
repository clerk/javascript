import type { BillingSubscriptionResource, EnvironmentResource } from '@clerk/types';
import { useCallback, useMemo } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkQuery } from '../clerk-rq/useQuery';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import type { SubscriptionResult, UseSubscriptionParams } from './useSubscription.types';

const hookName = 'useSubscription';

/**
 * @internal
 * This is the new implementation of useSubscription using React Query.
 * It is exported only if the package is build with the `CLERK_USE_RQ` environment variable set to `true`.
 */
export function useSubscription(params?: UseSubscriptionParams): SubscriptionResult<BillingSubscriptionResource> {
  useAssertWrappedByClerkProvider(hookName);

  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  // @ts-expect-error `__unstable__environment` is not typed
  const environment = clerk.__unstable__environment as unknown as EnvironmentResource | null | undefined;

  clerk.telemetry?.record(eventMethodCalled(hookName));

  const isOrganization = params?.for === 'organization';
  const billingEnabled = isOrganization
    ? environment?.commerceSettings.billing.organization.enabled
    : environment?.commerceSettings.billing.user.enabled;

  const queryClient = useClerkQueryClient();

  const queryKey = useMemo(() => {
    return [
      'commerce-subscription',
      {
        userId: user?.id,
        args: { orgId: isOrganization ? organization?.id : undefined },
      },
    ];
  }, [user?.id, isOrganization, organization?.id]);

  const query = useClerkQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const obj = queryKey[1] as { args: { orgId?: string } };
      return clerk.billing.getSubscription(obj.args);
    },
    staleTime: 1_000 * 60,
    enabled: Boolean(user?.id && billingEnabled),
  });

  const revalidate = useCallback(() => queryClient.invalidateQueries({ queryKey }), [queryClient, queryKey]);

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    revalidate,
  };
}
