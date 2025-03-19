import { useClerk, useOrganization } from '@clerk/shared/react';
import type { __experimental_CommerceSubscriberType, __experimental_CommerceSubscriptionResource } from '@clerk/types';

import { useFetch } from './useFetch';

type UsePlansProps = {
  subscriberType: __experimental_CommerceSubscriberType;
};

export const usePlans = (props: UsePlansProps) => {
  const { subscriberType } = props;
  const { __experimental_commerce } = useClerk();

  const activeUserSubscriptions: __experimental_CommerceSubscriptionResource[] = [];
  const { subscriptions: orgSubscriptions } = useOrganization({ subscriptions: { status: 'active' } });
  const activeOrgSubscriptions: __experimental_CommerceSubscriptionResource[] = orgSubscriptions?.data || [];
  const activeSubscriptions = [...(subscriberType === 'user' ? activeUserSubscriptions : activeOrgSubscriptions)];

  const { data } = useFetch(__experimental_commerce?.__experimental_billing.getPlans, { subscriberType });

  const plans =
    data?.map(plan => {
      const activeSubscription = activeSubscriptions.find(sub => sub.plan.id === plan.id);
      plan.subscriptionIdForCurrentSubscriber = activeSubscription?.id;
      return plan;
    }) || [];

  return {
    plans,
    activeSubscriptions,
  };
};
