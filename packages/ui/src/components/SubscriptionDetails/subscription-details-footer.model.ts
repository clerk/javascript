import { __internal_useOrganizationBase, useClerk, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useSubscriberTypeContext, useSubscription } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { SubscriptionDetailsFooterModel } from './subscription-details.types';

export const useSubscriptionDetailsFooterModel = (subscriptionId: string | null): SubscriptionDetailsFooterModel => {
  const subscriberType = useSubscriberTypeContext();
  const { data: subscription, subscriptionItems } = useSubscription({ keepPreviousData: false });
  const selectedSubscription = subscriptionItems?.find(item => item.id === subscriptionId);
  const organization = __internal_useOrganizationBase();
  const { user } = useUser();
  const clerk = useClerk();
  const actor = user?.id;
  const subject = subscriberType === 'organization' ? organization?.id : actor;
  const scope = JSON.stringify([actor, subscriberType, subject]);
  const current = useRef({ scope, subscriptionItems });
  current.current = { scope, subscriptionItems };
  const isCurrentScope = () =>
    !!actor &&
    !!subject &&
    clerk.user?.id === actor &&
    (subscriberType === 'organization' ? clerk.organization?.id : clerk.user?.id) === subject &&
    current.current.scope === scope &&
    (subscriberType === 'user' || !!clerk.session?.checkAuthorization({ permission: 'org:sys_billing:manage' }));

  const cancelSubscription = async () => {
    if (!isCurrentScope()) {
      return false;
    }
    const selected = current.current.subscriptionItems?.find(item => item.id === subscriptionId);
    if (!selected) {
      return false;
    }
    await selected.cancel({ orgId: subscriberType === 'organization' ? subject : undefined });
    return isCurrentScope();
  };

  return {
    hasNextPayment: !!subscription?.nextPayment,
    hasSelection: !!selectedSubscription,
    selectionId: selectedSubscription?.id ?? null,
    isCurrentScope,
    cancelSubscription,
    keepLabel: selectedSubscription?.isFreeTrial
      ? localizationKeys('billing.keepFreeTrial')
      : localizationKeys('billing.keepSubscription'),
    cancelLabel: selectedSubscription?.isFreeTrial
      ? localizationKeys('billing.cancelFreeTrial', { plan: selectedSubscription.plan.name })
      : localizationKeys('billing.cancelSubscription'),
    titleLabel: selectedSubscription
      ? selectedSubscription.isFreeTrial
        ? localizationKeys('billing.cancelFreeTrialTitle', { plan: selectedSubscription.plan.name })
        : localizationKeys('billing.cancelSubscriptionTitle', {
            plan: `${selectedSubscription.status === 'upcoming' ? 'upcoming ' : ''}${selectedSubscription.plan.name}`,
          })
      : null,
    descriptionLabel: selectedSubscription
      ? selectedSubscription.isFreeTrial
        ? localizationKeys('billing.cancelFreeTrialAccessUntil', {
            plan: selectedSubscription.plan.name,
            date: (selectedSubscription.periodEnd && new Date(selectedSubscription.periodEnd.getTime())) as Date,
          })
        : selectedSubscription.status === 'upcoming'
          ? localizationKeys('billing.cancelSubscriptionNoCharge')
          : selectedSubscription.status === 'past_due'
            ? localizationKeys('billing.cancelSubscriptionPastDue')
            : localizationKeys('billing.cancelSubscriptionAccessUntil', {
                plan: selectedSubscription.plan.name,
                date: (selectedSubscription.periodEnd && new Date(selectedSubscription.periodEnd.getTime())) as Date,
              })
      : null,
  };
};
