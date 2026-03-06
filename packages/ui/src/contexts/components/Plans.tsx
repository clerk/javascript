import {
  __experimental_usePaymentAttempts,
  __experimental_usePaymentMethods,
  __experimental_usePlans,
  __experimental_useStatements,
  __experimental_useSubscription,
  __internal_useOrganizationBase,
  useClerk,
  useSession,
} from '@clerk/shared/react';
import type {
  BillingPlanResource,
  BillingSubscriptionItemResource,
  BillingSubscriptionPlanPeriod,
} from '@clerk/shared/types';
import { useCallback, useMemo } from 'react';

import { useProtect } from '@/ui/common/Gate';
import { getClosestProfileScrollBox } from '@/ui/utils/getClosestProfileScrollBox';

import type { Appearance } from '../../internal/appearance';
import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import { useSubscriberTypeContext } from './SubscriberType';

/**
 * Only remove decimal places if they are '00', to match previous behavior.
 */
export function normalizeFormatted(formatted: string) {
  return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
}

const useBillingHookParams = () => {
  const subscriberType = useSubscriberTypeContext();
  const allowBillingRoutes = useProtect(
    has =>
      has({
        permission: 'org:sys_billing:read',
      }) || has({ permission: 'org:sys_billing:manage' }),
  );
  // Do not use `useOrganization` to avoid triggering the in-app enable organizations prompt in development instance
  const organization = __internal_useOrganizationBase();

  return {
    for: subscriberType,
    keepPreviousData: true,
    // If the user is in an organization, only fetch billing data if they have the necessary permissions
    enabled: subscriberType === 'organization' ? Boolean(organization) && allowBillingRoutes : true,
  };
};

export const usePaymentMethods = () => {
  const params = useBillingHookParams();
  return __experimental_usePaymentMethods(params);
};

export const usePaymentAttempts = () => {
  const params = useBillingHookParams();
  return __experimental_usePaymentAttempts(params);
};

export const useStatements = (externalParams?: { mode: 'cache' }) => {
  const params = useBillingHookParams();
  return __experimental_useStatements({ ...params, __experimental_mode: externalParams?.mode });
};

export const useSubscription = () => {
  const params = useBillingHookParams();
  const subscription = __experimental_useSubscription(params);
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
    enabled: true,
    __experimental_mode: params?.mode,
  });
};

type HandleSelectPlanProps = {
  plan: BillingPlanResource;
  planPeriod: BillingSubscriptionPlanPeriod;
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

  const { revalidate: revalidatePaymentMethods } = usePaymentMethods();

  const revalidateAll = useCallback(() => {
    // Revalidate the plans and subscriptions
    void revalidateSubscriptions();
    void revalidatePlans();
    void revalidateStatements();
    void revalidatePaymentMethods();
  }, [revalidateSubscriptions, revalidatePlans, revalidateStatements, revalidatePaymentMethods]);

  // should the default plan be shown as active
  const isDefaultPlanImplicitlyActiveOrUpcoming = useMemo(() => {
    // are there no subscriptions or are all subscriptions canceled
    return subscriptionItems.length === 0 || !subscriptionItems.some(subscription => !subscription.canceledAt);
  }, [subscriptionItems]);

  // return the active or upcoming subscription for a plan if it exists
  const activeOrUpcomingSubscription = useCallback(
    (plan: BillingPlanResource) => {
      return subscriptionItems.find(subscription => subscription.plan.id === plan.id);
    },
    [subscriptionItems],
  );

  // returns all subscriptions for a plan that are active or upcoming
  const activeAndUpcomingSubscriptions = useCallback(
    (plan: BillingPlanResource) => {
      return subscriptionItems.filter(subscription => subscription.plan.id === plan.id);
    },
    [subscriptionItems],
  );

  // return the active or upcoming subscription for a plan based on the plan period, if there is no subscription for the plan period, return the first subscription
  const activeOrUpcomingSubscriptionWithPlanPeriod = useCallback(
    (plan: BillingPlanResource, planPeriod: BillingSubscriptionPlanPeriod = 'month') => {
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
    ({ plan, subscription: sub }: { plan?: BillingPlanResource; subscription?: BillingSubscriptionItemResource }) => {
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
      plan?: BillingPlanResource;
      subscription?: BillingSubscriptionItemResource;
      isCompact?: boolean;
      selectedPlanPeriod?: BillingSubscriptionPlanPeriod;
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
      const isEligibleForSwitchToAnnual = Boolean(plan?.annualMonthlyFee);

      if (_selectedPlanPeriod === 'annual' && !isEligibleForSwitchToAnnual) {
        _selectedPlanPeriod = 'month';
      }

      const freeTrialOr = (localizationKey: LocalizationKey): LocalizationKey => {
        if (plan?.freeTrialEnabled) {
          // Show trial CTA if user is signed out OR if signed in and eligible for free trial
          const isSignedOut = !session;
          const isEligibleForTrial = topLevelSubscription?.eligibleForFreeTrial;

          if (isSignedOut || isEligibleForTrial) {
            return localizationKeys('billing.startFreeTrial__days', { days: plan.freeTrialDays ?? 0 });
          }
        }
        return localizationKey;
      };

      const getLocalizationKey = () => {
        // Handle subscription cases
        if (subscription) {
          if (_selectedPlanPeriod !== subscription.planPeriod && subscription.canceledAt) {
            if (_selectedPlanPeriod === 'month') {
              return localizationKeys('billing.switchToMonthly');
            }

            if (isEligibleForSwitchToAnnual) {
              return localizationKeys('billing.switchToAnnual');
            }
          }

          if (subscription.canceledAt) {
            return localizationKeys('billing.reSubscribe');
          }

          if (_selectedPlanPeriod !== subscription.planPeriod) {
            if (_selectedPlanPeriod === 'month') {
              return localizationKeys('billing.switchToMonthly');
            }

            if (isEligibleForSwitchToAnnual) {
              return localizationKeys('billing.switchToAnnual');
            }

            return localizationKeys('billing.manageSubscription');
          }

          return localizationKeys('billing.manageSubscription');
        }

        // Handle non-subscription cases
        const hasNonDefaultSubscriptions =
          subscriptionItems.filter(subscription => !subscription.plan.isDefault).length > 0;

        return hasNonDefaultSubscriptions
          ? localizationKeys('billing.switchPlan')
          : freeTrialOr(localizationKeys('billing.subscribe'));
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

  const captionForSubscription = useCallback((subscription: BillingSubscriptionItemResource) => {
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
      return localizationKeys(subscription.isFreeTrial ? 'badge__trialEndsAt' : 'badge__renewsAt', {
        date: subscription.periodEnd,
      });
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
        planPeriod: planPeriod === 'annual' && !plan.annualMonthlyFee ? 'month' : planPeriod,
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
