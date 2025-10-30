import { useCallback } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import type { EnvironmentResource, ForPayerType } from '../../types';
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

/**
 * @internal
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
