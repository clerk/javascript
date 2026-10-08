import { __internal_useOrganizationBase, useUser } from '@clerk/shared/react';

import { useSubscriberTypeContext, useSubscription } from '../../contexts';
import type { SubscriptionDetailsModel } from './subscription-details.types';

export const useSubscriptionDetailsModel = (): SubscriptionDetailsModel => {
  const { subscriptionItems, isLoading } = useSubscription({ keepPreviousData: false });
  const { user } = useUser();
  const organization = __internal_useOrganizationBase();
  const subscriberType = useSubscriberTypeContext();

  return {
    subscriptionIds: (subscriptionItems ?? []).map(item => item.id),
    scope: JSON.stringify([user?.id, subscriberType, subscriberType === 'organization' ? organization?.id : user?.id]),
    isLoading,
    hasSubscription: !!subscriptionItems?.some(item => item.status === 'active' || item.status === 'past_due'),
  };
};
