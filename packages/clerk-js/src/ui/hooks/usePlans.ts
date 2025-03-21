import { useClerk, useOrganization } from '@clerk/shared/react';
import type { __experimental_CommerceSubscriberType, __experimental_CommerceSubscriptionResource } from '@clerk/types';

import { useFetch } from './useFetch';

type UsePlansProps = {
  subscriberType: __experimental_CommerceSubscriberType;
};

export const usePlans = (props: UsePlansProps) => {
  const { subscriberType } = props;
  const { __experimental_commerce } = useClerk();

  const { data: userSubscriptions, revalidate: revalidateUserSubscriptions } = useFetch(
    __experimental_commerce?.__experimental_billing.getSubscriptions,
    {},
  );
  const activeUserSubscriptions: __experimental_CommerceSubscriptionResource[] = userSubscriptions?.data || [];
  const { subscriptions: orgSubscriptions } = useOrganization({ subscriptions: true });
  const activeOrgSubscriptions: __experimental_CommerceSubscriptionResource[] = orgSubscriptions?.data || [];

  const activeSubscriptions = [...(subscriberType === 'user' ? activeUserSubscriptions : activeOrgSubscriptions)];

  const { data: allPlans, revalidate: revalidatePlans } = useFetch(
    __experimental_commerce?.__experimental_billing.getPlans,
    { subscriberType },
    { staleTime: 0 },
  );

  const plans =
    allPlans?.map(plan => {
      const activeSubscription = activeSubscriptions.find(sub => sub.plan.id === plan.id);
      plan.subscriptionIdForCurrentSubscriber = activeSubscription?.id;
      return plan;
    }) || [];

  const revalidate = async () => {
    console.log('revalidating plans and subscriptions');
    // Revalidate the plans and subscriptions
    await orgSubscriptions?.revalidate?.();
    revalidateUserSubscriptions();
    revalidatePlans();
  };

  return {
    plans,
    activeSubscriptions,
    revalidate,
  };
};
