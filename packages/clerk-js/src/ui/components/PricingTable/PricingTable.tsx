/* eslint-disable react-hooks/rules-of-hooks */
import { useClerk } from '@clerk/shared/react';
import type { __experimental_PricingTableProps, CommercePlanResource } from '@clerk/types';
import { useState } from 'react';

import { __experimental_CheckoutContext, usePricingTableContext } from '../../contexts';
import { Box, descriptors } from '../../customizables';
import { useFetch } from '../../hooks';
import { InternalThemeProvider } from '../../styledSystem';
import { __experimental_Checkout } from '../Checkout';
import { PlanCard } from './PlanCard';
import { PlanDetailBlade } from './PlanDetailBlade';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const { __experimental_commerce } = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const [planPeriod, setPlanPeriod] = useState('month');
  const [selectedPlan, setSelectedPlan] = useState<CommercePlanResource>();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const isCompact = mode === 'modal';

  const { data: plans } = useFetch(__experimental_commerce?.__experimental_billing.getPlans, 'commerce-plans');

  const selectPlan = (plan: CommercePlanResource) => {
    setSelectedPlan(plan);
    if (plan.isActiveForPayer) {
      setShowPlanDetail(true);
    } else {
      setShowCheckout(true);
    }
  };

  return (
    <InternalThemeProvider>
      <Box
        elementDescriptor={descriptors.planGrid}
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${isCompact ? '11.75rem' : '20rem'}), 1fr))`,
          alignItems: 'start',
          gap: '1rem',
          width: '100%',
          minWidth: '0',
        }}
      >
        {plans?.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            period={planPeriod}
            setPeriod={setPlanPeriod}
            onSelect={selectPlan}
            isCompact={isCompact}
            props={props}
          />
        ))}
      </Box>
      {/* eslint-disable-next-line react/jsx-pascal-case */}
      <__experimental_CheckoutContext.Provider
        value={{
          componentName: 'Checkout',
          mode,
          isShowingBlade: showCheckout,
          handleCloseBlade: () => setShowCheckout(false),
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          {/* eslint-disable-next-line react/jsx-pascal-case */}
          <__experimental_Checkout
            planPeriod={planPeriod}
            planId={selectedPlan?.id}
          />
        </div>
      </__experimental_CheckoutContext.Provider>
      <PlanDetailBlade
        isOpen={showPlanDetail}
        handleClose={() => setShowPlanDetail(false)}
        plan={selectedPlan}
      />
    </InternalThemeProvider>
  );
};
