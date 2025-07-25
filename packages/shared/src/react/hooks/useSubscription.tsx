import { useCallback } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import { useSWR } from '../clerk-swr';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';

const hookName = 'useSubscription';

type UseSubscriptionParams = {
  for?: 'organization' | 'user';
  /**
   * If `true`, the previous data will be kept in the cache until new data is fetched.
   *
   * @default false
   */
  keepPreviousData?: boolean;
};

/**
 * @internal
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 *
 * Fetches subscription data for the current user or organization.
 */
export const useSubscription = (params?: UseSubscriptionParams) => {
  useAssertWrappedByClerkProvider(hookName);

  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  clerk.telemetry?.record(eventMethodCalled(hookName));

  const swr = useSWR(
    user?.id
      ? {
          type: 'commerce-subscription',
          userId: user.id,
          args: { orgId: params?.for === 'organization' ? organization?.id : undefined },
        }
      : null,
    ({ args }) => clerk.billing.getSubscription(args),
    {
      dedupingInterval: 1_000 * 60,
      keepPreviousData: params?.keepPreviousData,
    },
  );

  const revalidate = useCallback(() => swr.mutate(), [swr.mutate]);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
    revalidate,
  };
};
