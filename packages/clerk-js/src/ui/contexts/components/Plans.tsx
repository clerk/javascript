import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import type {
  Appearance,
  CommercePlanResource,
  CommerceSubscriptionPlanPeriod,
  CommerceSubscriptionResource,
} from '@clerk/types';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { CommerceSubscription } from '../../../core/resources/internal';
import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import { getClosestProfileScrollBox } from '../../utils';
import { useSubscriberTypeContext } from './SubscriberType';

const dedupeOptions = {
  dedupingInterval: 1_000 * 60, // 1 minute,
  keepPreviousData: true,
};

export const usePaymentSourcesCacheKey = () => {
  const { organization } = useOrganization();
  const { user } = useUser();
  const subscriberType = useSubscriberTypeContext();

  return {
    key: `commerce-payment-sources`,
    resourceId: subscriberType === 'org' ? organization?.id : user?.id,
  };
};

export const usePaymentSources = () => {
  const { organization } = useOrganization();
  const { user } = useUser();
  const subscriberType = useSubscriberTypeContext();
  const cacheKey = usePaymentSourcesCacheKey();

  return useSWR(cacheKey, () => (subscriberType === 'org' ? organization : user)?.getPaymentSources({}), dedupeOptions);
};

export const usePaymentAttemptsCacheKey = () => {
  const { organization } = useOrganization();
  const { user } = useUser();
  const subscriberType = useSubscriberTypeContext();

  return {
    key: `commerce-payment-history`,
    userId: user?.id,
    args: { orgId: subscriberType === 'org' ? organization?.id : undefined },
  };
};

export const usePaymentAttempts = () => {
  const { billing } = useClerk();
  const cacheKey = usePaymentAttemptsCacheKey();

  return useSWR(cacheKey, ({ args, userId }) => (userId ? billing.getPaymentAttempts(args) : undefined), dedupeOptions);
};

export const useStatementsCacheKey = () => {
  const { organization } = useOrganization();
  const { user } = useUser();
  const subscriberType = useSubscriberTypeContext();

  return {
    key: `commerce-statements`,
    userId: user?.id,
    args: { orgId: subscriberType === 'org' ? organization?.id : undefined },
  };
};

export const useStatements = () => {
  const { billing } = useClerk();
  const cacheKey = useStatementsCacheKey();

  return useSWR(cacheKey, ({ args, userId }) => (userId ? billing.getStatements(args) : undefined), dedupeOptions);
};

export const useSubscriptions = () => {
  const { billing } = useClerk();
  const { organization } = useOrganization();
  const { user, isSignedIn } = useUser();
  const subscriberType = useSubscriberTypeContext();
  const { data: plans } = usePlans();

  const { data: _subscriptions, ...rest } = useSWR(
    {
      key: `commerce-subscriptions`,
      userId: user?.id,
      args: { orgId: subscriberType === 'org' ? organization?.id : undefined },
    },
    ({ args, userId }) => (userId ? billing.getSubscriptions(args) : undefined),
    dedupeOptions,
  );

  const subscriptions = useMemo(() => {
    if (!_subscriptions) {
      return [];
    }
    const defaultFreePlan = plans?.find(plan => plan.hasBaseFee === false && plan.amount === 0);

    // are we signed in, is there a default free plan, and should it be shown as active or upcoming? then add an implicit subscription
    if (
      isSignedIn &&
      defaultFreePlan &&
      (_subscriptions.data.length === 0 || !_subscriptions.data.some(subscription => !subscription.canceledAt))
    ) {
      const canceledSubscription = _subscriptions.data.find(subscription => subscription.canceledAt);
      return [
        ..._subscriptions.data,
        new CommerceSubscription({
          object: 'commerce_subscription',
          id: '__implicit_default_plan_subscription__',
          payment_source_id: '',
          plan: defaultFreePlan.__internal_toSnapshot(),
          plan_period: 'month',
          canceled_at: null,
          status: _subscriptions.data.length === 0 ? 'active' : 'upcoming',
          period_start: canceledSubscription?.periodEnd || 0,
          period_end: 0,
        }),
      ];
    }
    return _subscriptions.data;
  }, [_subscriptions, plans, isSignedIn]);

  return {
    data: subscriptions,
    ...rest,
  };
};

export const usePlans = () => {
  const { billing } = useClerk();
  const subscriberType = useSubscriberTypeContext();

  return useSWR(
    {
      key: `commerce-plans`,
      args: { subscriberType },
    },
    ({ args }) => billing.getPlans(args),
    dedupeOptions,
  );
};

type HandleSelectPlanProps = {
  plan: CommercePlanResource;
  planPeriod: CommerceSubscriptionPlanPeriod;
  onSubscriptionChange?: () => void;
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

  const { data: subscriptions, mutate: mutateSubscriptions } = useSubscriptions();

  // Invalidates cache but does not fetch immediately
  const { data: plans, mutate: mutatePlans } = useSWR<Awaited<ReturnType<typeof clerk.billing.getPlans>>>({
    key: `commerce-plans`,
    args: { subscriberType },
  });

  // Invalidates cache but does not fetch immediately
  const { mutate: mutateStatements } =
    useSWR<Awaited<ReturnType<typeof clerk.billing.getStatements>>>(useStatementsCacheKey());

  const { mutate: mutatePaymentSources } = usePaymentSources();

  const revalidateAll = useCallback(() => {
    // Revalidate the plans and subscriptions
    void mutateSubscriptions();
    void mutatePlans();
    void mutateStatements();
    void mutatePaymentSources();
  }, [mutateSubscriptions, mutatePlans, mutateStatements, mutatePaymentSources]);

  // should the default plan be shown as active
  const isDefaultPlanImplicitlyActiveOrUpcoming = useMemo(() => {
    // are there no subscriptions or are all subscriptions canceled
    return subscriptions.length === 0 || !subscriptions.some(subscription => !subscription.canceledAt);
  }, [subscriptions]);

  // return the active or upcoming subscription for a plan if it exists
  const activeOrUpcomingSubscription = useCallback(
    (plan: CommercePlanResource) => {
      return subscriptions.find(subscription => subscription.plan.id === plan.id);
    },
    [subscriptions],
  );

  // returns all subscriptions for a plan that are active or upcoming
  const activeAndUpcomingSubscriptions = useCallback(
    (plan: CommercePlanResource) => {
      return subscriptions.filter(subscription => subscription.plan.id === plan.id);
    },
    [subscriptions],
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
    ({ plan, subscription: sub }: { plan?: CommercePlanResource; subscription?: CommerceSubscriptionResource }) => {
      const subscription = sub ?? (plan ? activeOrUpcomingSubscription(plan) : undefined);

      return !subscription || !subscription.canceledAt;
    },
    [activeOrUpcomingSubscription],
  );

  // should the default plan be shown as active
  const upcomingSubscriptionsExist = useMemo(() => {
    return (
      subscriptions.some(subscription => subscription.status === 'upcoming') || isDefaultPlanImplicitlyActiveOrUpcoming
    );
  }, [subscriptions, isDefaultPlanImplicitlyActiveOrUpcoming]);

  // return the CTA button props for a plan
  const buttonPropsForPlan = useCallback(
    ({
      plan,
      subscription: sub,
      isCompact = false,
      selectedPlanPeriod = 'annual',
    }: {
      plan?: CommercePlanResource;
      subscription?: CommerceSubscriptionResource;
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
          subscriptions.filter(subscription => !subscription.plan.isDefault).length > 0;
        return hasNonDefaultSubscriptions
          ? localizationKeys('commerce.switchPlan')
          : localizationKeys('commerce.subscribe');
      };

      return {
        localizationKey: getLocalizationKey(),
        variant: isCompact ? 'bordered' : 'solid',
        colorScheme: isCompact ? 'secondary' : 'primary',
        isDisabled: !canManageBilling,
        disabled: !canManageBilling,
      };
    },
    [activeOrUpcomingSubscriptionWithPlanPeriod, canManageBilling, subscriptions],
  );

  const captionForSubscription = useCallback((subscription: CommerceSubscriptionResource) => {
    if (subscription.status === 'upcoming') {
      return localizationKeys('badge__startsAt', { date: subscription.periodStart });
    } else if (subscription.canceledAt) {
      return localizationKeys('badge__canceledEndsAt', { date: subscription.periodEnd });
    } else {
      return localizationKeys('badge__renewsAt', { date: subscription.periodEnd });
    }
  }, []);

  // handle the selection of a plan, either by opening the subscription details or checkout
  const handleSelectPlan = useCallback(
    ({
      plan,
      planPeriod,
      onSubscriptionChange,
      mode = 'mounted',
      event,
      appearance,
      newSubscriptionRedirectUrl,
    }: HandleSelectPlanProps) => {
      const subscription = activeOrUpcomingSubscriptionWithPlanPeriod(plan, planPeriod);

      const portalRoot = getClosestProfileScrollBox(mode, event);

      if (subscription && subscription.planPeriod === planPeriod && !subscription.canceledAt) {
        clerk.__internal_openPlanDetails({
          plan,
          initialPlanPeriod: planPeriod,
          subscriberType,
          onSubscriptionCancel: () => {
            revalidateAll();
            onSubscriptionChange?.();
          },
          appearance,
          portalRoot,
        });
      } else {
        clerk.__internal_openCheckout({
          planId: plan.id,
          // if the plan doesn't support annual, use monthly
          planPeriod: planPeriod === 'annual' && plan.annualMonthlyAmount === 0 ? 'month' : planPeriod,
          subscriberType,
          onSubscriptionComplete: () => {
            revalidateAll();
            onSubscriptionChange?.();
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
      }
    },
    [clerk, revalidateAll, activeOrUpcomingSubscription, subscriberType, session?.id],
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
    buttonPropsForPlan,
    canManageSubscription,
    captionForSubscription,
    upcomingSubscriptionsExist,
    defaultFreePlan,
    revalidateAll,
  };
};
