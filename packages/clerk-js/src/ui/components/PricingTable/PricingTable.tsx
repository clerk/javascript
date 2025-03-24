import { useClerk, useOrganization } from '@clerk/shared/react';
import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
  __experimental_PricingTableProps,
} from '@clerk/types';
import { useState } from 'react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { __experimental_CheckoutContext, usePricingTableContext } from '../../contexts';
import { AppearanceProvider } from '../../customizables';
import { usePlans } from '../../hooks';
import { __experimental_Checkout } from '../Checkout';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';
import { SubscriptionDetailDrawer } from './SubscriptionDetailDrawer';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const clerk = useClerk();
  const { organization } = useOrganization();
  const { mode = 'mounted', subscriberType = 'user' } = usePricingTableContext();
  const isCompact = mode === 'modal';

  const { plans, activeSubscriptions, revalidate } = usePlans({ subscriberType });

  const [planPeriod, setPlanPeriod] = useState<__experimental_CommerceSubscriptionPlanPeriod>('month');
  const [checkoutPlan, setCheckoutPlan] = useState<__experimental_CommercePlanResource>();
  const [detailSubscription, setDetailSubscription] = useState<__experimental_CommerceSubscriptionResource>();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showSubscriptionDetailDrawer, setShowSubscriptionDetailDrawer] = useState(false);

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
    if (!clerk.isSignedIn) {
      void clerk.redirectToSignIn();
    }
    const activeSubscription = activeSubscriptions.find(sub => sub.id === plan.subscriptionIdForCurrentSubscriber);
    if (activeSubscription) {
      setDetailSubscription(activeSubscription);
      setShowSubscriptionDetailDrawer(true);
    } else {
      setCheckoutPlan(plan);
      setShowCheckout(true);
    }
  };

  const onSubscriptionChange = async () => {
    await revalidate();
  };

  return (
    <>
      {mode !== 'modal' && props.layout === 'matrix' ? (
        <PricingTableMatrix
          plans={plans || []}
          planPeriod={planPeriod}
          setPlanPeriod={setPlanPeriod}
          onSelect={selectPlan}
          highlightedPlan={props.highlightPlan}
        />
      ) : (
        <PricingTableDefault
          plans={plans}
          planPeriod={planPeriod}
          setPlanPeriod={setPlanPeriod}
          onSelect={selectPlan}
          isCompact={isCompact}
          props={props}
        />
      )}

      <AppearanceProvider
        appearanceKey='checkout'
        appearance={props.checkoutProps?.appearance}
      >
        <__experimental_CheckoutContext.Provider
          value={{
            componentName: 'Checkout',
            mode,
            isOpen: showCheckout,
            setIsOpen: setShowCheckout,
          }}
        >
          {/*TODO: Used by InvisibleRootBox, can we simplify? */}
          <div>
            {checkoutPlan && (
              <__experimental_Checkout
                planPeriod={planPeriod}
                planId={checkoutPlan.id}
                orgId={subscriberType === 'org' ? organization?.id : undefined}
                onSubscriptionComplete={onSubscriptionChange}
              />
            )}
          </div>
        </__experimental_CheckoutContext.Provider>
        <SubscriptionDetailDrawer
          isOpen={showSubscriptionDetailDrawer}
          setIsOpen={setShowSubscriptionDetailDrawer}
          subscription={detailSubscription}
          setPlanPeriod={setPlanPeriod}
          strategy={mode === 'mounted' ? 'fixed' : 'absolute'}
          portalProps={{
            id: mode === 'modal' ? PROFILE_CARD_SCROLLBOX_ID : undefined,
          }}
          onSubscriptionCancel={onSubscriptionChange}
        />
      </AppearanceProvider>
    </>
  );
};
