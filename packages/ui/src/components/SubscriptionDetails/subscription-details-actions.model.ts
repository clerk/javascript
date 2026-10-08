import { __internal_useOrganizationBase, useClerk, useUser } from '@clerk/shared/react';
import type { BillingSubscriptionItemResource } from '@clerk/shared/types';
import { useRef } from 'react';

import { useProtect } from '@/ui/common/Gate';
import { isManageableSubscriptionItem } from '@/ui/utils/billingSubscription';

import { usePlansContext, useSubscriberTypeContext, useSubscription } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import type { SubscriptionDetailsActionsModel } from './subscription-details.types';

const getCapabilities = (subscription: BillingSubscriptionItemResource) => {
  const isManageable = isManageableSubscriptionItem(subscription);
  return {
    switch:
      ((subscription.planPeriod === 'month' && Boolean(subscription.plan.annualMonthlyFee)) ||
        (subscription.planPeriod === 'annual' && Boolean(subscription.plan.fee))) &&
      subscription.status !== 'past_due' &&
      isManageable,
    cancel: subscription.canceledAt === null && isManageable,
    resubscribe: subscription.canceledAt !== null && isManageable,
  };
};

export const useSubscriptionDetailsActionsModel = (
  subscriptionId: string,
  portalRoot?: HTMLElement | null,
): SubscriptionDetailsActionsModel | null => {
  const { subscriptionItems } = useSubscription({ keepPreviousData: false });
  const clerk = useClerk();
  const { user } = useUser();
  const organization = __internal_useOrganizationBase();
  const subscriberType = useSubscriberTypeContext();
  const { revalidateAll } = usePlansContext();
  const { $ } = useLocalizations();
  const canOrgManageBilling = useProtect(has => has({ permission: 'org:sys_billing:manage' }));
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
  const canManageBilling = !!actor && !!subject && (subscriberType === 'user' || canOrgManageBilling);
  const subscription = subscriptionItems?.find(item => item.id === subscriptionId);
  if (!subscription) {
    return null;
  }
  const capabilities = getCapabilities(subscription);
  const canRun = (action: 'switch' | 'cancel' | 'resubscribe') => {
    const selected = current.current.subscriptionItems?.find(item => item.id === subscriptionId);
    return isCurrentScope() && !!selected && getCapabilities(selected)[action];
  };
  const openCheckout = (action: 'switch' | 'resubscribe') => {
    const selected = current.current.subscriptionItems?.find(item => item.id === subscriptionId);
    if (!isCurrentScope() || !selected || !getCapabilities(selected)[action]) {
      return false;
    }
    let completed = false;
    clerk.__internal_openCheckout({
      planId: selected.plan.id,
      planPeriod: action === 'switch' ? (selected.planPeriod === 'month' ? 'annual' : 'month') : selected.planPeriod,
      for: subscriberType,
      onSubscriptionComplete: () => {
        if (!completed && isCurrentScope()) {
          completed = true;
          void revalidateAll();
        }
      },
      portalRoot,
    });
    return true;
  };

  return {
    subscriptionId,
    canRun,
    canManageBilling,
    isSwitchable: capabilities.switch,
    isCancellable: capabilities.cancel,
    isReSubscribable: capabilities.resubscribe,
    switchPlan: () => openCheckout('switch'),
    reSubscribe: () => openCheckout('resubscribe'),
    switchLabel:
      canManageBilling && capabilities.switch
        ? subscription.planPeriod === 'month'
          ? localizationKeys('billing.switchToAnnualWithAnnualPrice', {
              price: $(subscription.plan.annualFee as NonNullable<typeof subscription.plan.annualFee>, {
                style: 'short',
              }),
            })
          : localizationKeys('billing.switchToMonthlyWithPrice', {
              price: $(subscription.plan.fee as NonNullable<typeof subscription.plan.fee>, { style: 'short' }),
            })
        : null,
    cancelLabel: subscription.isFreeTrial
      ? localizationKeys('billing.cancelFreeTrial', { plan: subscription.plan.name })
      : localizationKeys('billing.cancelSubscription'),
    reSubscribeLabel: localizationKeys('billing.reSubscribe'),
  };
};
