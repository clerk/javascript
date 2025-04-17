import { useClerk, useOrganization } from '@clerk/shared/react';
import type { __experimental_CommercePlanResource, __experimental_CommerceSubscriberType } from '@clerk/types';
import type { ComponentType, ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { useFetch } from '../../hooks';
import type { __experimental_PlansCtx } from '../../types';

type PlansContextProviderProps = {
  subscriberType?: __experimental_CommerceSubscriberType;
};

const PlansContext = createContext<__experimental_PlansCtx | null>(null);

export const PlansContextProvider = ({
  subscriberType = 'user',
  children,
}: PlansContextProviderProps & {
  children: ReactNode;
}) => {
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();

  const {
    data: subscriptions,
    isLoading: isLoadingSubscriptions,
    revalidate: revalidateSubscriptions,
  } = useFetch(
    __experimental_commerce?.__experimental_billing.getSubscriptions,
    { orgId: subscriberType === 'org' ? organization?.id : undefined },
    undefined,
    'commerce-subscriptions',
  );

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

  const activeOrUpcomingSubscription = useCallback(
    (plan: __experimental_CommercePlanResource) => {
      return subscriptions?.data.find(subscription => subscription.plan.id === plan.id);
    },
    [subscriptions],
  );

  const isDefaultPlanImplicitlyActive = useMemo(() => {
    return subscriptions?.total_count === 0;
  }, [subscriptions]);

  return (
    <PlansContext.Provider
      value={{
        componentName: 'Plans',
        subscriberType: subscriberType || 'user',
        plans: plans || [],
        subscriptions: subscriptions?.data || [],
        isLoading: isLoadingSubscriptions || isLoadingPlans || false,
        revalidate,
        activeOrUpcomingSubscription,
        isDefaultPlanImplicitlyActive,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
};

export const usePlansContext = () => {
  const context = useContext(PlansContext);

  if (!context || context.componentName !== 'Plans') {
    throw new Error('Clerk: usePlansContext called outside Plans.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
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
