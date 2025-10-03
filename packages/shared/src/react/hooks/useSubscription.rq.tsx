import type { BillingSubscriptionResource, EnvironmentResource } from '@clerk/types';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
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
export function useDebounce<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();

    if (lastUpdated.current && now >= lastUpdated.current + delay) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const id = window.setTimeout(() => {
        lastUpdated.current = now;
        setThrottledValue(value);
      }, delay);

      return () => window.clearTimeout(id);
    }
  }, [value, delay]);

  return throttledValue;
}

const useClerkQueryClient = () => {
  const clerk = useClerkInstanceContext();
  // // @ts-expect-error - __internal_queryClient is not typed
  // console.log('useClerkQueryClient, clerk', clerk.__internal_queryClient);
  // @ts-expect-error - __internal_queryClient is not typed
  const [queryStatus, setQueryStatus] = useState('__tag' in clerk.__internal_queryClient ? 'ready' : 'loading');
  console.log('useClerkQueryClient, queryStatus', queryStatus);
  useEffect(() => {
    // @ts-expect-error - queryClientStatus is not typed
    clerk.on('queryClientStatus', setQueryStatus);
    return () => {
      // @ts-expect-error - queryClientStatus is not typed
      clerk.off('queryClientStatus', setQueryStatus);
    };
  }, [clerk]);

  const queryClient = useMemo(() => {
    // @ts-expect-error - __internal_queryClient is not typed
    console.log('useClerkQueryClient, clerk.__internal_queryClient', clerk.__internal_queryClient);
    // @ts-expect-error - __internal_queryClient is not typed
    return clerk.__internal_queryClient;
    // @ts-expect-error - __internal_queryClient is not typed
  }, [queryStatus, clerk.status, clerk.__internal_queryClient]);

  const debouncedQueryStatus = useDebounce(
    '__tag' in queryClient && queryClient.__tag === 'clerk-rq-client' ? 'ready' : queryStatus,
    5_000,
  );
  console.log('useClerkQueryClient, debouncedQueryStatus', debouncedQueryStatus);

  return [queryClient.client, debouncedQueryStatus];
};

/**
 *
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

  const [queryClient, queryStatus] = useClerkQueryClient();

  const queryKey = useMemo(() => {
    return [
      'commerce-subscription',
      {
        userId: user?.id,
        args: { orgId: isOrganization ? organization?.id : undefined },
      },
    ];
  }, [user?.id, isOrganization, organization?.id]);

  console.log('enabled', Boolean(user?.id && billingEnabled) && clerk.status === 'ready' && queryStatus === 'ready');

  const query = useQuery(
    {
      queryKey,
      queryFn: ({ queryKey }) => {
        const obj = queryKey[1] as { args: { orgId?: string } };
        console.log('queryFn, obj', obj);
        return clerk.billing.getSubscription(obj.args);
      },
      staleTime: 1_000 * 60,
      enabled: Boolean(user?.id && billingEnabled) && clerk.status === 'ready' && queryStatus === 'ready',
    },
    queryClient,
  );

  const revalidate = useCallback(() => queryClient.invalidateQueries({ queryKey }), [queryClient, queryKey]);

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    revalidate,
  };
}
