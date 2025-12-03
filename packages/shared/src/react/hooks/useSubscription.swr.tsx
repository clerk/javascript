import { useCallback } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import type { EnvironmentResource } from '../../types';
import { useSWR } from '../clerk-swr';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import { useSubscriptionCacheKeys } from './useSubscription.shared';
import type { SubscriptionResult, UseSubscriptionParams } from './useSubscription.types';

const hookName = 'useSubscription';

/**
 * This is the existing implementation of useSubscription using SWR.
 * It is kept here for backwards compatibility until our next major version.
 *
 * @internal
 */
export function useSubscription(params?: UseSubscriptionParams): SubscriptionResult {
  useAssertWrappedByClerkProvider(hookName);

  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  // @ts-expect-error `__internal__environment` is not typed
  const environment = clerk.__internal__environment as unknown as EnvironmentResource | null | undefined;

  clerk.telemetry?.record(eventMethodCalled(hookName));

  const isOrganization = params?.for === 'organization';
  const billingEnabled = isOrganization
    ? environment?.commerceSettings.billing.organization.enabled
    : environment?.commerceSettings.billing.user.enabled;
  const isEnabled = (params?.enabled ?? true) && billingEnabled;

  const { queryKey } = useSubscriptionCacheKeys({
    userId: user?.id,
    orgId: organization?.id,
    for: params?.for,
  });

  const swr = useSWR(
    isEnabled ? { queryKey } : null,
    ({ queryKey }) => {
      const args = queryKey[3].args;

      if (queryKey[2].userId) {
        return clerk.billing.getSubscription(args);
      }
      return null;
    },
    {
      dedupingInterval: 1_000 * 60,
      keepPreviousData: params?.keepPreviousData,
    },
  );

  const revalidate = useCallback(() => {
    void swr.mutate();
  }, [swr]);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
    revalidate,
  };
}
