import type { BillingSubscriptionResource, EnvironmentResource } from '@clerk/types';
import { useCallback } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import { useSWR } from '../clerk-swr';
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
 */
export function useSubscription(params?: UseSubscriptionParams): SubscriptionResult<BillingSubscriptionResource> {
  useAssertWrappedByClerkProvider(hookName);
  console.log('useSubscription SWR');

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

  const swr = useSWR(
    billingEnabled
      ? {
          type: 'commerce-subscription',
          userId: user?.id,
          args: { orgId: isOrganization ? organization?.id : undefined },
        }
      : null,
    ({ args, userId }) => {
      if (userId) {
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
