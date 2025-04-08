import { useClerk, useOrganization } from '@clerk/shared/react';
import type { __experimental_CommerceSubscriberType } from '@clerk/types';
import { useMemo } from 'react';

import { useFetch } from './useFetch';

type UsePlansProps = {
  subscriberType: __experimental_CommerceSubscriberType;
};

export const usePlans = (props: UsePlansProps) => {
  const { subscriberType = 'user' } = props;
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();

  const { data: subscriptions, revalidate: revalidateSubscriptions } = useFetch(
    __experimental_commerce?.__experimental_billing.getSubscriptions,
    { orgId: subscriberType === 'org' ? organization?.id : undefined },
    undefined,
    'commerce-subscriptions',
  );

  const { data: allPlans, revalidate: revalidatePlans } = useFetch(
    __experimental_commerce?.__experimental_billing.getPlans,
    { subscriberType },
  );

  const plans = useMemo(() => {
    if (!subscriptions) {
      return [];
    }
    return (
      allPlans?.map(plan => {
        const activeSubscription = subscriptions.data.find(sub => {
          return sub.plan.id === plan.id;
        });
        plan.subscriptionIdForCurrentSubscriber = activeSubscription?.id;
        return plan;
      }) || []
    );
  }, [allPlans, subscriptions]);

  const revalidate = () => {
    // Revalidate the plans and subscriptions
    revalidateSubscriptions();
    revalidatePlans();
  };

  return {
    plans,
    subscriptions: subscriptions?.data || [],
    revalidate,
  };
};
