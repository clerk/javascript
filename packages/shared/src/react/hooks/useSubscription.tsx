import type { BillingSubscriptionResource, EnvironmentResource, ForPayerType } from '@clerk/types';
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

/**
 * @interface
 */
export type UseSubscriptionParams = {
  /**
   * Specifies whether to fetch subscription for an organization or user.
   *
   * @default 'user'
   */
  for?: ForPayerType;
  /**
   * If `true`, the previous data will be kept in the cache until new data is fetched. This helps prevent layout shifts.
   *
   * @default false
   */
  keepPreviousData?: boolean;
};

/**
 * @interface
 */
export type UseSubscriptionReturn =
  | {
      /**
       * The subscription object, or `null` if the data hasn't been loaded yet.
       */
      data: null;
      /**
       * A boolean that indicates whether the initial data is still being fetched.
       */
      isLoading: false;
      /**
       * A boolean that indicates whether any request is still in flight, including background updates.
       */
      isFetching: false;
      /**
       * Any error that occurred during the data fetch, or `null` if no error occurred.
       */
      error: null;
      /**
       * Function to manually trigger a refresh of the subscription data.
       */
      revalidate: () => Promise<void>;
    }
  | {
      data: BillingSubscriptionResource;
      isLoading: true;
      isFetching: true;
      error: Error;
      revalidate: () => Promise<void>;
    }
  | {
      data: BillingSubscriptionResource | null;
      isLoading: boolean;
      isFetching: boolean;
      error: Error | null;
      revalidate: () => Promise<void>;
    };

/**
 *
 * Fetches subscription data for the current user or organization.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export const useSubscription = (params?: UseSubscriptionParams) => {
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

  const swr = useSWR(
    billingEnabled
      ? {
          type: 'commerce-subscription',
          userId: user?.id,
          args: { orgId: isOrganization ? organization?.id : undefined },
        }
      : null,
    ({ args, userId }) => {
      // This allows for supporting keeping previous data between revalidations
      // but also hides the stale data on sign-out.
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

  const revalidate = useCallback(() => swr.mutate(), [swr.mutate]);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
    revalidate,
  };
};
