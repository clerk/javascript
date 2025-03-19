import { useClerk } from '@clerk/shared/react';
import type { __experimental_CommercePlanResource, __experimental_PricingTableProps } from '@clerk/types';
import { useState } from 'react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { __experimental_CheckoutContext, usePricingTableContext } from '../../contexts';
import { useFetch } from '../../hooks';
import { __experimental_Checkout } from '../Checkout';
import { PlanDetailDrawer } from './PlanDetailDrawer';
import { PricingTableMatrix } from './PricingTableMatrix';
import { PricingTableDefault } from './PricingTableDefault';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const { __experimental_commerce } = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const [planPeriod, setPlanPeriod] = useState<'month' | 'annual'>('month');
  const [selectedPlan, setSelectedPlan] = useState<__experimental_CommercePlanResource>();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const isCompact = mode === 'modal';

  const { data: plans } = useFetch(__experimental_commerce?.__experimental_billing.getPlans, 'commerce-plans');

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
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
          highlightedPlan={props.matrixHighlightedPlan}
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
    </>
  );
};
