import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type {
  CommercePlanResource,
  CommerceSubscriberType,
  CommerceSubscriptionPlanPeriod,
  CommerceSubscriptionResource,
} from '@clerk/types';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { useFetch } from '../../hooks';
import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import type { PlansCtx } from '../../types';
import { getClosestProfileScrollBox } from '../../utils';
import { useSubscriberTypeContext } from './SubscriberType';

const PlansContext = createContext<PlansCtx | null>(null);

export const useSubscriptions = (subscriberType?: CommerceSubscriberType) => {
  const { billing } = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();
  const resource = subscriberType === 'org' ? organization : user;

  return useFetch(
    user ? billing.getSubscriptions : undefined,
    { orgId: subscriberType === 'org' ? organization?.id : undefined },
    undefined,
    `commerce-subscriptions-${resource?.id}`,
  );
};

export const PlansContextProvider = ({ children }: PropsWithChildren) => {
  const { billing } = useClerk();
  const { organization } = useOrganization();
  const { user, isSignedIn } = useUser();
  const subscriberType = useSubscriberTypeContext();
  const resource = subscriberType === 'org' ? organization : user;

  const {
    data: subscriptions,
    isLoading: isLoadingSubscriptions,
    revalidate: revalidateSubscriptions,
  } = useSubscriptions(subscriberType);

  const {
    data: plans,
    isLoading: isLoadingPlans,
    revalidate: revalidatePlans,
  } = useFetch(billing.getPlans, { subscriberType }, undefined, 'commerce-plans');

  // Revalidates the next time the hooks gets mounted
  const { revalidate: revalidateInvoices } = useFetch(
    undefined,
    {
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    undefined,
    `commerce-invoices-${resource?.id}`,
  );

  const revalidate = useCallback(() => {
    // Revalidate the plans and subscriptions
    revalidateSubscriptions();
    revalidatePlans();
    revalidateInvoices();
  }, [revalidateInvoices, revalidatePlans, revalidateSubscriptions]);

  const isLoaded = useMemo(() => {
    if (isSignedIn) {
      return isLoadingSubscriptions === false && isLoadingPlans === false;
    }
    return isLoadingPlans === false;
  }, [isLoadingPlans, isLoadingSubscriptions, isSignedIn]);

  return (
    <PlansContext.Provider
      value={{
        componentName: 'Plans',
        plans: isLoaded ? (plans ?? []) : [],
        subscriptions: subscriptions?.data || [],
        isLoading: isLoadingSubscriptions || isLoadingPlans || false,
        revalidate,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
};

type HandleSelectPlanProps = {
  plan: CommercePlanResource;
  planPeriod: CommerceSubscriptionPlanPeriod;
  onSubscriptionChange?: () => void;
  mode?: 'modal' | 'mounted';
  event?: React.MouseEvent<HTMLElement>;
};

export const usePlansContext = () => {
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const context = useContext(PlansContext);

  if (!context || context.componentName !== 'Plans') {
    throw new Error('Clerk: usePlansContext called outside Plans.');
  }

  const canManageBilling = useMemo(() => {
    if (!clerk.session) {
      return true;
    }

    if (clerk?.session?.checkAuthorization({ permission: 'org:sys_billing:manage' }) || subscriberType === 'user') {
      return true;
    }

    return false;
  }, [clerk, subscriberType]);

  const { componentName, ...ctx } = context;

  // return the active or upcoming subscription for a plan if it exists
  const activeOrUpcomingSubscription = useCallback(
    (plan: CommercePlanResource) => {
      return ctx.subscriptions.find(subscription => subscription.plan.id === plan.id);
    },
    [ctx.subscriptions],
  );

  // should the default plan be shown as active
  const isDefaultPlanImplicitlyActiveOrUpcoming = useMemo(() => {
    // are there no subscriptions or are all subscriptions canceled
    return ctx.subscriptions.length === 0 || !ctx.subscriptions.some(subscription => !subscription.canceledAt);
  }, [ctx.subscriptions]);

  const canManageSubscription = useCallback(
    ({ plan, subscription: sub }: { plan?: CommercePlanResource; subscription?: CommerceSubscriptionResource }) => {
      const subscription = sub ?? (plan ? activeOrUpcomingSubscription(plan) : undefined);

      return !subscription || !subscription.canceledAt;
    },
    [activeOrUpcomingSubscription],
  );

  // return the CTA button props for a plan
  const buttonPropsForPlan = useCallback(
    ({
      plan,
      subscription: sub,
      isCompact = false,
    }: {
      plan?: CommercePlanResource;
      subscription?: CommerceSubscriptionResource;
      isCompact?: boolean;
    }): {
      localizationKey: LocalizationKey;
      variant: 'bordered' | 'solid';
      colorScheme: 'secondary' | 'primary';
      isDisabled: boolean;
    } => {
      const subscription = sub ?? (plan ? activeOrUpcomingSubscription(plan) : undefined);

      return {
        localizationKey: subscription
          ? subscription.canceledAt
            ? localizationKeys('commerce.reSubscribe')
            : localizationKeys('commerce.manageSubscription')
          : // If there are no active or grace period subscriptions, show the get started button
            ctx.subscriptions.length > 0
            ? localizationKeys('commerce.switchPlan')
            : localizationKeys('commerce.subscribe'),
        variant: isCompact ? 'bordered' : 'solid',
        colorScheme: isCompact ? 'secondary' : 'primary',
        isDisabled: !canManageBilling,
      };
    },
    [activeOrUpcomingSubscription],
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
    ({ plan, planPeriod, onSubscriptionChange, mode = 'mounted', event }: HandleSelectPlanProps) => {
      const subscription = activeOrUpcomingSubscription(plan);

      const portalRoot = getClosestProfileScrollBox(mode, event);

      if (subscription && !subscription.canceledAt) {
        clerk.__internal_openPlanDetails({
          plan,
          subscriberType,
          onSubscriptionCancel: () => {
            ctx.revalidate();
            onSubscriptionChange?.();
          },
          portalRoot,
        });
      } else {
        // if the plan doesn't support annual, use monthly
        let _planPeriod = planPeriod;
        if (planPeriod === 'annual' && plan.annualMonthlyAmount === 0) {
          _planPeriod = 'month';
        }

        clerk.__internal_openCheckout({
          planId: plan.id,
          planPeriod: _planPeriod,
          subscriberType: subscriberType,
          onSubscriptionComplete: () => {
            ctx.revalidate();
            onSubscriptionChange?.();
          },
          portalRoot,
        });
      }
    },
    [clerk, ctx, activeOrUpcomingSubscription, subscriberType],
  );

  const defaultFreePlan = useMemo(() => {
    return ctx.plans.find(plan => plan.isDefault);
  }, [ctx.plans]);

  return {
    ...ctx,
    componentName,
    activeOrUpcomingSubscription,
    isDefaultPlanImplicitlyActiveOrUpcoming,
    handleSelectPlan,
    buttonPropsForPlan,
    canManageSubscription,
    captionForSubscription,
    defaultFreePlan,
  };
};
