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

  const { data: userSubscriptions, revalidate: revalidateUserSubscriptions } = useFetch(
    subscriberType === 'user' ? __experimental_commerce?.__experimental_billing.getSubscriptions : undefined,
    'commerce-user-subscriptions',
  );
  const { subscriptions: orgSubscriptions } = useOrganization({
    subscriptions: subscriberType === 'org' ? true : undefined,
  });

  const { data: allPlans, revalidate: revalidatePlans } = useFetch(
    __experimental_commerce?.__experimental_billing.getPlans,
    { subscriberType },
  );

  const activeSubscriptions = useMemo(() => {
    if ((subscriberType === 'user' && !userSubscriptions) || (subscriberType === 'org' && !orgSubscriptions)) {
      return undefined;
    }
    return [...(subscriberType === 'user' ? userSubscriptions?.data || [] : orgSubscriptions?.data || [])];
  }, [userSubscriptions, orgSubscriptions, subscriberType]);

  const plans = useMemo(() => {
    if (!activeSubscriptions) {
      return [];
    }
    return (
      allPlans?.map(plan => {
        const activeSubscription = activeSubscriptions.find(sub => {
          return sub.plan.id === plan.id;
        });
        plan.subscriptionIdForCurrentSubscriber = activeSubscription?.id;
        return plan;
      }) || []
    );
  }, [allPlans, activeSubscriptions]);

  const revalidate = async () => {
    // Revalidate the plans and subscriptions
    await orgSubscriptions?.revalidate?.();
    revalidateUserSubscriptions();
    revalidatePlans();
  };

  return {
    plans,
    subscriptions: activeSubscriptions || [],
    revalidate,
  };
};
