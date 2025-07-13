import type { CommerceSubscriptionResource, GetSubscriptionsParams } from '@clerk/types';

import { eventMethodCalled } from '../../telemetry/events';
import { useSWR } from '../clerk-swr';
import { useClerkInstanceContext, useOrganizationContext, useUserContext } from '../contexts';
import { createCommerceHook } from './createCommerceHook';

/**
 * @internal
 */
export const useSubscriptionItems = createCommerceHook<CommerceSubscriptionResource, GetSubscriptionsParams>({
  hookName: 'useSubscriptionItems',
  resourceType: 'commerce-subscription-items',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    return clerk.billing.getSubscriptions;
  },
});

const dedupeOptions = {
  dedupingInterval: 1_000 * 60, // 1 minute,
  keepPreviousData: true,
};

export const useSubscription = (params?: { for: 'organization' | 'user' }) => {
  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();
  clerk.telemetry?.record(eventMethodCalled('useSubscription'));
  return useSWR(
    {
      type: 'commerce-subscription',
      userId: user?.id,
      args: { orgId: params?.for === 'organization' ? organization?.id : undefined },
    },
    ({ args, userId }) => (userId ? clerk.billing.getSubscription(args) : undefined),
    dedupeOptions,
  );
};
