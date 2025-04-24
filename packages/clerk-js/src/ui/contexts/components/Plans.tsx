import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriberType,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
} from '@clerk/types';
import type { ComponentType, ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID, USER_PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { useFetch } from '../../hooks';
import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import type { __experimental_PlansCtx } from '../../types';

type PlansContextProviderProps = {
  subscriberType?: __experimental_CommerceSubscriberType;
};

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

export const PlansContextProvider = ({
  subscriberType = 'user',
  children,
}: PlansContextProviderProps & {
  children: ReactNode;
}) => {
  const { __experimental_commerce } = useClerk();

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

  const revalidate = () => {
    // Revalidate the plans and subscriptions
    revalidateSubscriptions();
    revalidatePlans();
  };

  return (
    <PlansContext.Provider
      value={{
        componentName: 'Plans',
        subscriberType: subscriberType || 'user',
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
  providerPropsFromHOC: PlansContextProviderProps = {},
) => {
  // Define props for the returned component
  type WithPlansProps = T & {
    providerProps?: PlansContextProviderProps;
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
          : localizationKeys('__experimental_commerce.getStarted'),
        variant: isCompact || !!subscription ? 'bordered' : 'solid',
        colorScheme: isCompact || !!subscription ? 'secondary' : 'primary',
      };
    },
    [activeOrUpcomingSubscription],
  );

  // handle the selection of a plan, either by opening the subscription details or checkout
  const handleSelectPlan = useCallback(
    ({ plan, planPeriod, onSubscriptionChange, mode = 'mounted' }: HandleSelectPlanProps) => {
      const subscription = activeOrUpcomingSubscription(plan);

      if (subscription && !subscription.canceledAt) {
        clerk.__internal_openSubscriptionDetails({
          subscription,
          subscriberType: ctx.subscriberType,
          onSubscriptionCancel: () => {
            ctx.revalidate();
            onSubscriptionChange?.();
          },
          portalId:
            mode === 'modal'
              ? ctx.subscriberType === 'user'
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
          subscriberType: ctx.subscriberType,
          onSubscriptionComplete: () => {
            ctx.revalidate();
            onSubscriptionChange?.();
          },
          portalId:
            mode === 'modal'
              ? ctx.subscriberType === 'user'
                ? USER_PROFILE_CARD_SCROLLBOX_ID
                : ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID
              : undefined,
        });
      }
    },
    [clerk, ctx, activeOrUpcomingSubscription],
  );

  return {
    ...ctx,
    componentName,
    activeOrUpcomingSubscription,
    isDefaultPlanImplicitlyActive,
    handleSelectPlan,
    buttonPropsForPlan,
  };
};
