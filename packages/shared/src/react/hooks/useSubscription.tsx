import type { ClerkEventPayload, ForPayerType } from '@clerk/types';
import { useCallback, useEffect } from 'react';

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
  for?: ForPayerType;
  /**
   * If `true`, the previous data will be kept in the cache until new data is fetched.
   *
   * @default false
   */
  keepPreviousData?: boolean;
};

const revalidateOnEvents: ClerkEventPayload['resource:action'][] = ['checkout.confirm'];

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

  useEffect(() => {
    const on = clerk.on.bind(clerk);
    const off = clerk.off.bind(clerk);
    const handler = (payload: ClerkEventPayload['resource:action']) => {
      if (revalidateOnEvents.includes(payload)) {
        // When multiple handlers call `revalidate` the request will fire only once.
        void revalidate();
      }
    };

    on('resource:action', handler);
    return () => {
      off('resource:action', handler);
    };
  }, [revalidate]);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
    revalidate,
  };
};
