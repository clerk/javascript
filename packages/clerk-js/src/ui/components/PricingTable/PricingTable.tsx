import { useClerk } from '@clerk/shared/react';
import type { __experimental_PricingTableProps, CommercePlanResource } from '@clerk/types';
import { useState } from 'react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { __experimental_CheckoutContext, usePricingTableContext } from '../../contexts';
import { Box, descriptors } from '../../customizables';
import { useFetch } from '../../hooks';
import { InternalThemeProvider } from '../../styledSystem';
import { __experimental_Checkout } from '../Checkout';
import { PlanCard, type PlanPeriod } from './PlanCard';
import { PlanDetailDrawer } from './PlanDetailDrawer';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const { __experimental_commerce } = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const [planPeriod, setPlanPeriod] = useState<PlanPeriod>('month');
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
            planPeriod={planPeriod}
            setPlanPeriod={setPlanPeriod}
            onSelect={selectPlan}
            props={props}
            isCompact={isCompact}
          />
        ))}
      </Box>
      <__experimental_CheckoutContext.Provider
        value={{
          componentName: 'Checkout',
          mode,
          open: showCheckout,
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
        open={showPlanDetail}
        setIsOpen={setShowPlanDetail}
        plan={selectedPlan}
        planPeriod={planPeriod}
        setPlanPeriod={setPlanPeriod}
        strategy={mode === 'mounted' ? 'fixed' : 'absolute'}
        portalProps={{
          id: mode === 'modal' ? PROFILE_CARD_SCROLLBOX_ID : undefined,
        }}
      />
    </InternalThemeProvider>
  );
};
