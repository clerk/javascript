import {
  __experimental_usePaymentAttempts,
  __experimental_usePaymentMethods,
  __experimental_usePlans,
  __experimental_useStatements,
  __experimental_useSubscription,
  useClerk,
  useSession,
} from '@clerk/shared/react';
import type {
  Appearance,
  CommercePlanResource,
  CommerceSubscriptionItemResource,
  CommerceSubscriptionPlanPeriod,
} from '@clerk/types';
import { useCallback, useMemo } from 'react';

import { getClosestProfileScrollBox } from '@/ui/utils/getClosestProfileScrollBox';

import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import { useSubscriberTypeContext } from './SubscriberType';

// TODO(@COMMERCE): Rename payment sources to payment methods at the API level
export const usePaymentMethods = () => {
  const subscriberType = useSubscriberTypeContext();
  return __experimental_usePaymentMethods({
    for: subscriberType,
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: true,
  });
};

export const usePaymentAttempts = () => {
  const subscriberType = useSubscriberTypeContext();
  return __experimental_usePaymentAttempts({
    for: subscriberType,
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: true,
  });
};

export const useStatements = (params?: { mode: 'cache' }) => {
  const subscriberType = useSubscriberTypeContext();
  return __experimental_useStatements({
    for: subscriberType,
    initialPage: 1,
    pageSize: 10,
    keepPreviousData: true,
    __experimental_mode: params?.mode,
  });
};

export const useSubscription = () => {
  const subscriberType = useSubscriberTypeContext();
  const subscription = __experimental_useSubscription({
    for: subscriberType,
    keepPreviousData: true,
  });
  const subscriptionItems = useMemo(
    () => subscription.data?.subscriptionItems || [],
    [subscription.data?.subscriptionItems],
  );

  return {
    ...subscription,
    subscriptionItems,
  };
};

export const usePlans = (params?: { mode: 'cache' }) => {
  const subscriberType = useSubscriberTypeContext();

  return __experimental_usePlans({
    for: subscriberType,
    initialPage: 1,
    pageSize: 50,
    keepPreviousData: true,
    __experimental_mode: params?.mode,
  });
};

type HandleSelectPlanProps = {
  plan: CommercePlanResource;
  planPeriod: CommerceSubscriptionPlanPeriod;
  mode?: 'modal' | 'mounted';
  event?: React.MouseEvent<HTMLElement>;
  appearance?: Appearance;
  newSubscriptionRedirectUrl?: string;
};

export const usePlansContext = () => {
  const clerk = useClerk();
  const { session } = useSession();
  const subscriberType = useSubscriberTypeContext();

  const canManageBilling = useMemo(() => {
    if (!clerk.session) {
      return true;
    }

    if (clerk?.session?.checkAuthorization({ permission: 'org:sys_billing:manage' }) || subscriberType === 'user') {
      return true;
    }

    return false;
  }, [clerk, subscriberType]);

  const { subscriptionItems, revalidate: revalidateSubscriptions, data: topLevelSubscription } = useSubscription();

  // Invalidates cache but does not fetch immediately
  const { data: plans, revalidate: revalidatePlans } = usePlans({ mode: 'cache' });

  // Invalidates cache but does not fetch immediately
  const { revalidate: revalidateStatements } = useStatements({ mode: 'cache' });

  const { revalidate: revalidatePaymentSources } = usePaymentMethods();

  const revalidateAll = useCallback(() => {
    // Revalidate the plans and subscriptions
    void revalidateSubscriptions();
    void revalidatePlans();
    void revalidateStatements();
    void revalidatePaymentSources();
  }, [revalidateSubscriptions, revalidatePlans, revalidateStatements, revalidatePaymentSources]);

  // should the default plan be shown as active
  const isDefaultPlanImplicitlyActiveOrUpcoming = useMemo(() => {
    // are there no subscriptions or are all subscriptions canceled
    return subscriptionItems.length === 0 || !subscriptionItems.some(subscription => !subscription.canceledAt);
  }, [subscriptionItems]);

  // return the active or upcoming subscription for a plan if it exists
  const activeOrUpcomingSubscription = useCallback(
    (plan: CommercePlanResource) => {
      return subscriptionItems.find(subscription => subscription.plan.id === plan.id);
    },
    [subscriptionItems],
  );

  // returns all subscriptions for a plan that are active or upcoming
  const activeAndUpcomingSubscriptions = useCallback(
    (plan: CommercePlanResource) => {
      return subscriptionItems.filter(subscription => subscription.plan.id === plan.id);
    },
    [subscriptionItems],
  );

  // return the active or upcoming subscription for a plan based on the plan period, if there is no subscription for the plan period, return the first subscription
  const activeOrUpcomingSubscriptionWithPlanPeriod = useCallback(
    (plan: CommercePlanResource, planPeriod: CommerceSubscriptionPlanPeriod = 'month') => {
      const plansSubscriptions = activeAndUpcomingSubscriptions(plan);
      // Handle multiple subscriptions for the same plan
      if (plansSubscriptions.length > 1) {
        const subscriptionBaseOnPanPeriod = plansSubscriptions.find(subscription => {
          return subscription.planPeriod === planPeriod;
        });

        if (subscriptionBaseOnPanPeriod) {
          return subscriptionBaseOnPanPeriod;
        }

        return plansSubscriptions[0];
      }

      if (plansSubscriptions.length === 1) {
        return plansSubscriptions[0];
      }

      return undefined;
    },
    [activeAndUpcomingSubscriptions],
  );

  const canManageSubscription = useCallback(
    ({ plan, subscription: sub }: { plan?: CommercePlanResource; subscription?: CommerceSubscriptionItemResource }) => {
      const subscription = sub ?? (plan ? activeOrUpcomingSubscription(plan) : undefined);

      return !subscription || !subscription.canceledAt;
    },
    [activeOrUpcomingSubscription],
  );

  // return the CTA button props for a plan
  const buttonPropsForPlan = useCallback(
    ({
      plan,
      // TODO(@COMMERCE): This needs to be removed.
      subscription: sub,
      isCompact = false,
      selectedPlanPeriod = 'annual',
    }: {
      plan?: CommercePlanResource;
      subscription?: CommerceSubscriptionItemResource;
      isCompact?: boolean;
      selectedPlanPeriod?: CommerceSubscriptionPlanPeriod;
    }): {
      localizationKey: LocalizationKey;
      variant: 'bordered' | 'solid';
      colorScheme: 'secondary' | 'primary';
      isDisabled: boolean;
      disabled: boolean;
    } => {
      const subscription =
        sub ?? (plan ? activeOrUpcomingSubscriptionWithPlanPeriod(plan, selectedPlanPeriod) : undefined);
      let _selectedPlanPeriod = selectedPlanPeriod;
      if (_selectedPlanPeriod === 'annual' && sub?.plan.annualMonthlyAmount === 0) {
        _selectedPlanPeriod = 'month';
      }

      const isEligibleForSwitchToAnnual = (plan?.annualMonthlyAmount ?? 0) > 0;

      const freeTrialOr = (localizationKey: LocalizationKey): LocalizationKey => {
        if (plan?.freeTrialEnabled) {
          // Show trial CTA if user is signed out OR if signed in and eligible for free trial
          const isSignedOut = !session;
          const isEligibleForTrial = topLevelSubscription?.eligibleForFreeTrial;

          if (isSignedOut || isEligibleForTrial) {
            return localizationKeys('commerce.startFreeTrial', { days: plan.freeTrialDays ?? 0 });
          }
        }
        return localizationKey;
      };

      const getLocalizationKey = () => {
        // Handle subscription cases
        if (subscription) {
          if (_selectedPlanPeriod !== subscription.planPeriod && subscription.canceledAt) {
            if (_selectedPlanPeriod === 'month') {
              return localizationKeys('commerce.switchToMonthly');
            }

            if (isEligibleForSwitchToAnnual) {
              return localizationKeys('commerce.switchToAnnual');
            }
          }

          if (subscription.canceledAt) {
            return localizationKeys('commerce.reSubscribe');
          }

          if (_selectedPlanPeriod !== subscription.planPeriod) {
            if (_selectedPlanPeriod === 'month') {
              return localizationKeys('commerce.switchToMonthly');
            }

            if (isEligibleForSwitchToAnnual) {
              return localizationKeys('commerce.switchToAnnual');
            }

            return localizationKeys('commerce.manageSubscription');
          }

          return localizationKeys('commerce.manageSubscription');
        }

        // Handle non-subscription cases
        const hasNonDefaultSubscriptions =
          subscriptionItems.filter(subscription => !subscription.plan.isDefault).length > 0;

        return hasNonDefaultSubscriptions
          ? localizationKeys('commerce.switchPlan')
          : freeTrialOr(localizationKeys('commerce.subscribe'));
      };

      return {
        localizationKey: freeTrialOr(getLocalizationKey()),
        variant: isCompact ? 'bordered' : 'solid',
        colorScheme: isCompact ? 'secondary' : 'primary',
        isDisabled: !canManageBilling,
        disabled: !canManageBilling,
      };
    },
    [activeOrUpcomingSubscriptionWithPlanPeriod, canManageBilling, subscriptionItems, topLevelSubscription],
  );

  const captionForSubscription = useCallback((subscription: CommerceSubscriptionItemResource) => {
    if (subscription.pastDueAt) {
      return localizationKeys('badge__pastDueAt', { date: subscription.pastDueAt });
    }

    if (subscription.status === 'upcoming') {
      return localizationKeys('badge__startsAt', { date: subscription.periodStart });
    }
    if (subscription.canceledAt) {
      // @ts-expect-error `periodEndDate` is always defined when `canceledAtDate` exists
      return localizationKeys('badge__canceledEndsAt', { date: subscription.periodEnd });
    }
    if (subscription.periodEnd) {
      return localizationKeys('badge__renewsAt', { date: subscription.periodEnd });
    }
    return;
  }, []);

  const openSubscriptionDetails = useCallback(
    (event?: React.MouseEvent<HTMLElement>) => {
      const portalRoot = getClosestProfileScrollBox('modal', event);
      clerk.__internal_openSubscriptionDetails({
        for: subscriberType,
        onSubscriptionCancel: () => {
          revalidateAll();
        },
        portalRoot,
      });
    },
    [clerk, subscriberType, revalidateAll],
  );

  // handle the selection of a plan, either by opening the subscription details or checkout
  const handleSelectPlan = useCallback(
    ({ plan, planPeriod, mode = 'mounted', event, appearance, newSubscriptionRedirectUrl }: HandleSelectPlanProps) => {
      const portalRoot = getClosestProfileScrollBox(mode, event);

      clerk.__internal_openCheckout({
        planId: plan.id,
        // if the plan doesn't support annual, use monthly
        planPeriod: planPeriod === 'annual' && plan.annualMonthlyAmount === 0 ? 'month' : planPeriod,
        for: subscriberType,
        onSubscriptionComplete: () => {
          revalidateAll();
        },
        onClose: () => {
          if (session?.id) {
            void clerk.setActive({ session: session.id });
          }
        },
        appearance,
        portalRoot,
        newSubscriptionRedirectUrl,
      });
    },
    [clerk, revalidateAll, subscriberType, session?.id],
  );

  const defaultFreePlan = useMemo(() => {
    return plans?.find(plan => plan.isDefault);
  }, [plans]);

  return {
    activeOrUpcomingSubscription,
    activeAndUpcomingSubscriptions,
    activeOrUpcomingSubscriptionBasedOnPlanPeriod: activeOrUpcomingSubscriptionWithPlanPeriod,
    isDefaultPlanImplicitlyActiveOrUpcoming,
    handleSelectPlan,
    openSubscriptionDetails,
    buttonPropsForPlan,
    canManageSubscription,
    captionForSubscription,
    defaultFreePlan,
    revalidateAll,
  };
};
