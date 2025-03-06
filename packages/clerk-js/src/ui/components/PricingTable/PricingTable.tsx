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
        elementDescriptor={descriptors.pricingTable}
        sx={t => ({
          // Sets the minimum width a column can be before wrapping
          '--grid-min-size': isCompact ? '11.75rem' : '20rem',
          // Set a max amount of columns before they start wrapping to new rows.
          '--grid-max-columns': 'infinity',
          // Set the default gap, use `--grid-gap-y` to override the row gap
          '--grid-gap': t.space.$4,
          // Derived from the maximum column size based on the grid configuration
          '--max-column-width': '100% / var(--grid-max-columns, infinity) - var(--grid-gap)',
          // Derived from `--max-column-width` and ensures it respects the minimum size and maximum width constraints
          '--column-width': 'max(var(--max-column-width), min(var(--grid-min-size, 10rem), 100%))',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(var(--column-width), 1fr))',
          gap: `var(--grid-gap-y, var(--grid-gap, ${t.space.$4})) var(--grid-gap, ${t.space.$4})`,
          alignItems: 'start',
          width: '100%',
          minWidth: '0',
        })}
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
