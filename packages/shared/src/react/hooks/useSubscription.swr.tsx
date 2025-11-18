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
import { STABLE_KEYS } from '../stable-keys';
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

  // @ts-expect-error `__unstable__environment` is not typed
  const environment = clerk.__unstable__environment as unknown as EnvironmentResource | null | undefined;

  clerk.telemetry?.record(eventMethodCalled(hookName));

  const isOrganization = params?.for === 'organization';
  const billingEnabled = isOrganization
    ? environment?.commerceSettings.billing.organization.enabled
    : environment?.commerceSettings.billing.user.enabled;
  const isEnabled = (params?.enabled ?? true) && billingEnabled;

  const swr = useSWR(
    isEnabled
      ? {
          type: STABLE_KEYS.SUBSCRIPTION_KEY,
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
