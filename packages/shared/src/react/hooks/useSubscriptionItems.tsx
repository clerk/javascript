import type { ClerkPaginatedResponse, CommerceSubscriptionResource, GetSubscriptionsParams } from '@clerk/types';

import { eventMethodCalled } from '../../telemetry/events/method-called';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import type { PagesOrInfiniteOptions, PaginatedHookConfig, PaginatedResources } from '../types';
import { usePagesOrInfinite, useWithSafeValues } from './usePagesOrInfinite';

/**
 * @interface
 */
export type UseSubscriptionItemsParams = PaginatedHookConfig<PagesOrInfiniteOptions> & {
  for: 'organization' | 'user';
};

/**
 *
 */
export function useSubscriptionItems<T extends UseSubscriptionItemsParams>(
  params: T,
): PaginatedResources<CommerceSubscriptionResource, T extends { infinite: true } ? true : false> {
  const { for: _for, ...paginationParams } = params;

  useAssertWrappedByClerkProvider('useSubscriptionItems');

  const safeValues = useWithSafeValues(paginationParams, {
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: false,
    infinite: false,
    fetchOnMount: true,
  } as T);

  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  clerk.telemetry?.record(eventMethodCalled('useSubscriptionItems'));

  const subscriptionItemsParams =
    typeof paginationParams === 'undefined'
      ? undefined
      : {
          initialPage: safeValues.initialPage,
          pageSize: safeValues.pageSize,
          ...(_for === 'organization' ? { orgId: organization?.id } : {}),
        };

  const isClerkLoaded = !!(clerk.loaded && user);

  const subscriptionItems = usePagesOrInfinite<
    GetSubscriptionsParams,
    ClerkPaginatedResponse<CommerceSubscriptionResource>
  >(
    subscriptionItemsParams || {},
    clerk.billing.getSubscriptions,
    {
      keepPreviousData: safeValues.keepPreviousData,
      infinite: safeValues.infinite,
      fetchOnMount: safeValues.fetchOnMount,
      enabled: !!subscriptionItemsParams && isClerkLoaded,
    },
    {
      type: 'commerce-subscription-items',
      userId: user?.id,
      ...(_for === 'organization' ? { orgId: organization?.id } : {}),
    },
  );

  return subscriptionItems;
}
