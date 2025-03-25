import { useClerk } from '@clerk/shared/react';
import type { __experimental_CommercePlanResource, __experimental_PricingTableProps } from '@clerk/types';
import { useState } from 'react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { __experimental_CheckoutContext, usePricingTableContext } from '../../contexts';
import { AppearanceProvider } from '../../customizables';
import { useFetch } from '../../hooks';
import { __experimental_Checkout } from '../Checkout';
import { PlanDetailDrawer } from './PlanDetailDrawer';
import { PricingTableDefault } from './PricingTableDefault';
import { PricingTableMatrix } from './PricingTableMatrix';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const clerk = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const [planPeriod, setPlanPeriod] = useState<'month' | 'annual'>('month');
  const [selectedPlan, setSelectedPlan] = useState<__experimental_CommercePlanResource>();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const isCompact = mode === 'modal';

  const { data: plans } = useFetch(clerk.__experimental_commerce?.__experimental_billing.getPlans, 'commerce-plans');

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
    if (!clerk.isSignedIn) {
      void clerk.redirectToSignIn();
    }
    setSelectedPlan(plan);
    if (plan.isActiveForPayer) {
      setShowPlanDetail(true);
    } else {
      setShowCheckout(true);
    }
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
            <__experimental_Checkout
              planPeriod={planPeriod}
              planId={selectedPlan?.id}
            />
          </div>
        </__experimental_CheckoutContext.Provider>
        <PlanDetailDrawer
          isOpen={showPlanDetail}
          setIsOpen={setShowPlanDetail}
          plan={selectedPlan}
          planPeriod={planPeriod}
          setPlanPeriod={setPlanPeriod}
          strategy={mode === 'mounted' ? 'fixed' : 'absolute'}
          portalProps={{
            id: mode === 'modal' ? PROFILE_CARD_SCROLLBOX_ID : undefined,
          }}
        />
      </AppearanceProvider>
    </>
  );
};
