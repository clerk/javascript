import type { ClerkEventPayload, ForPayerType } from '@clerk/types';
import { useCallback, useMemo } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import { unstable_serialize, useSWR } from '../clerk-swr';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import { useThrottledEvent } from './useThrottledEvent';

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

const revalidateOnEvents: ClerkEventPayload['resource:action'][] = ['checkout.confirm', 'subscriptionItem.cancel'];

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

  const key = useMemo(
    () =>
      user?.id
        ? {
            type: 'commerce-subscription',
            userId: user.id,
            args: { orgId: params?.for === 'organization' ? organization?.id : undefined },
          }
        : null,
    [user?.id, organization?.id, params?.for],
  );

  const uniqueSWRKey = useMemo(() => unstable_serialize(key), [key]);

  const swr = useSWR(key, key => clerk.billing.getSubscription(key.args), {
    dedupingInterval: 1_000 * 60,
    keepPreviousData: params?.keepPreviousData,
    revalidateOnFocus: false,
  });

  const revalidate = useCallback(() => swr.mutate(), [swr.mutate]);

  // Maps cache key to event listener instead of matching the hook instance.
  // `swr.mutate` does not dedupe, N parallel calles will fire N revalidation requests.
  //  To avoid this, we use `useThrottledEvent` to dedupe the revalidation requests.
  useThrottledEvent({
    uniqueKey: uniqueSWRKey,
    events: revalidateOnEvents,
    onEvent: revalidate,
    clerk,
  });

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
    revalidate,
  };
};
