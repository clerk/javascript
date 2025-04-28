import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriberType,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
} from '@clerk/types';
import type { ComponentType, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID, USER_PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { useFetch } from '../../hooks';
import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import type { __experimental_PlansCtx } from '../../types';
import { useSubscriberTypeContext } from './SubscriberType';

const PlansContext = createContext<__experimental_PlansCtx | null>(null);

export const useSubscriptions = (subscriberType?: __experimental_CommerceSubscriberType) => {
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();
  return useFetch(
    user ? __experimental_commerce?.__experimental_billing.getSubscriptions : undefined,
    { orgId: subscriberType === 'org' ? organization?.id : undefined },
    undefined,
    `commerce-subscriptions-${user?.id}`,
  );
};

export const PlansContextProvider = ({ children }: PropsWithChildren) => {
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();
  const subscriberType = useSubscriberTypeContext();
  const {
    data: subscriptions,
    isLoading: isLoadingSubscriptions,
    revalidate: revalidateSubscriptions,
  } = useSubscriptions(subscriberType);

  const {
    data: plans,
    isLoading: isLoadingPlans,
    revalidate: revalidatePlans,
  } = useFetch(
    __experimental_commerce?.__experimental_billing.getPlans,
    { subscriberType },
    undefined,
    'commerce-plans',
  );

  // Revalidates the next time the hooks gets mounted
  const { revalidate: revalidateInvoices } = useFetch(
    undefined,
    {
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    undefined,
    `commerce-invoices-${user?.id}`,
  );

  const revalidate = useCallback(() => {
    // Revalidate the plans and subscriptions
    revalidateSubscriptions();
    revalidatePlans();
    revalidateInvoices();
  }, [revalidateInvoices, revalidatePlans, revalidateSubscriptions]);

  return (
    <PlansContext.Provider
      value={{
        componentName: 'Plans',
        plans: plans || [],
        subscriptions: subscriptions?.data || [],
        isLoading: isLoadingSubscriptions || isLoadingPlans || false,
        revalidate,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
};

export const withPlans = <T extends object>(
  WrappedComponent: ComponentType<T>,
  providerPropsFromHOC: PropsWithChildren = {},
) => {
  // Define props for the returned component
  type WithPlansProps = T & {
    providerProps?: PropsWithChildren;
  };

  const WithPlans: React.FC<WithPlansProps> = ({ providerProps = {}, ...componentProps }) => {
    const mergedProviderProps = {
      ...providerPropsFromHOC,
      ...providerProps,
    };

    return (
      <PlansContextProvider {...mergedProviderProps}>
        <WrappedComponent {...(componentProps as T)} />
      </PlansContextProvider>
    );
  };

  WithPlans.displayName = `WithPlans(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithPlans;
};

type HandleSelectPlanProps = {
  plan: __experimental_CommercePlanResource;
  planPeriod: __experimental_CommerceSubscriptionPlanPeriod;
  onSubscriptionChange?: () => void;
  mode?: 'modal' | 'mounted';
};

export const usePlansContext = () => {
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const context = useContext(PlansContext);

  if (!context || context.componentName !== 'Plans') {
    throw new Error('Clerk: usePlansContext called outside Plans.');
  }

  const { componentName, ...ctx } = context;

  // return the active or upcoming subscription for a plan if it exists
  const activeOrUpcomingSubscription = useCallback(
    (plan: __experimental_CommercePlanResource) => {
      return ctx.subscriptions.find(subscription => subscription.plan.id === plan.id);
    },
    [ctx.subscriptions],
  );

  // should the default plan be shown as active
  const isDefaultPlanImplicitlyActive = useMemo(() => {
    return ctx.subscriptions.length === 0;
  }, [ctx.subscriptions]);

  const canManageSubscription = useCallback(
    ({
      plan,
      subscription: sub,
    }: {
      plan?: __experimental_CommercePlanResource;
      subscription?: __experimental_CommerceSubscriptionResource;
    }) => {
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
      plan?: __experimental_CommercePlanResource;
      subscription?: __experimental_CommerceSubscriptionResource;
      isCompact?: boolean;
    }): { localizationKey: LocalizationKey; variant: 'bordered' | 'solid'; colorScheme: 'secondary' | 'primary' } => {
      const subscription = sub ?? (plan ? activeOrUpcomingSubscription(plan) : undefined);

      return {
        localizationKey: subscription
          ? subscription.canceledAt
            ? localizationKeys('__experimental_commerce.reSubscribe')
            : localizationKeys('__experimental_commerce.manageSubscription')
          : // If there are no active or grace period subscriptions, show the get started button
            ctx.subscriptions.length > 0
            ? localizationKeys('__experimental_commerce.switchPlan')
            : localizationKeys('__experimental_commerce.getStarted'),
        variant: isCompact || !!subscription ? 'bordered' : 'solid',
        colorScheme: isCompact || !!subscription ? 'secondary' : 'primary',
      };
    },
    [activeOrUpcomingSubscription],
  );

  const captionForSubscription = useCallback((subscription: __experimental_CommerceSubscriptionResource) => {
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
    ({ plan, planPeriod, onSubscriptionChange, mode = 'mounted' }: HandleSelectPlanProps) => {
      const subscription = activeOrUpcomingSubscription(plan);

      if (subscription && !subscription.canceledAt) {
        clerk.__internal_openSubscriptionDetails({
          plan,
          subscriberType,
          onSubscriptionCancel: () => {
            ctx.revalidate();
            onSubscriptionChange?.();
          },
          portalId:
            mode === 'modal'
              ? subscriberType === 'user'
                ? USER_PROFILE_CARD_SCROLLBOX_ID
                : ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID
              : undefined,
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
          portalId:
            mode === 'modal'
              ? subscriberType === 'user'
                ? USER_PROFILE_CARD_SCROLLBOX_ID
                : ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID
              : undefined,
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
    isDefaultPlanImplicitlyActive,
    handleSelectPlan,
    buttonPropsForPlan,
    canManageSubscription,
    captionForSubscription,
    defaultFreePlan,
  };
};
