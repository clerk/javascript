import type {
  __experimental_CommercePlanResource,
  __experimental_CommerceSubscriptionPlanPeriod,
  __experimental_CommerceSubscriptionResource,
  __experimental_PricingTableProps,
} from '@clerk/types';
import { useState } from 'react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { __experimental_CheckoutContext, usePricingTableContext } from '../../contexts';
import { Box, descriptors } from '../../customizables';
import { usePlans } from '../../hooks';
import { InternalThemeProvider } from '../../styledSystem';
import { __experimental_Checkout } from '../Checkout';
import { PlanCard } from './PlanCard';
import { SubscriptionDetailDrawer } from './SubscriptionDetailDrawer';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const { mode = 'mounted', subscriberType = 'user' } = usePricingTableContext();
  const isCompact = mode === 'modal';

  const { plans, activeSubscriptions } = usePlans({ subscriberType });

  const [planPeriod, setPlanPeriod] = useState<__experimental_CommerceSubscriptionPlanPeriod>('month');
  const [checkoutPlan, setCheckoutPlan] = useState<__experimental_CommercePlanResource>();
  const [detailSubscription, setDetailSubscription] = useState<__experimental_CommerceSubscriptionResource>();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showSubscriptionDetailDrawer, setShowSubscriptionDetailDrawer] = useState(false);

  const selectPlan = (plan: __experimental_CommercePlanResource) => {
    const activeSubscription = activeSubscriptions.find(sub => sub.id === plan.subscriptionIdForCurrentSubscriber);
    if (activeSubscription) {
      setDetailSubscription(activeSubscription);
      setShowSubscriptionDetailDrawer(true);
    } else {
      setCheckoutPlan(plan);
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
      />
    </InternalThemeProvider>
  );
};
