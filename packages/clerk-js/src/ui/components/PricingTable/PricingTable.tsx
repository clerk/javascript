import { useClerk } from '@clerk/shared/react';
import type { __experimental_CommercePlanResource, __experimental_PricingTableProps } from '@clerk/types';
import { useState } from 'react';

import { PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { __experimental_CheckoutContext, usePricingTableContext } from '../../contexts';
import { Box, descriptors, Icon, Text } from '../../customizables';
import { SegmentedControl } from '../../elements';
import { useFetch } from '../../hooks';
import { Check } from '../../icons';
import { InternalThemeProvider } from '../../styledSystem';
import { __experimental_Checkout } from '../Checkout';
import type { PlanPeriod } from './PlanCard';
import { PlanCard, PlanCardHeader } from './PlanCard';
import { PlanDetailDrawer } from './PlanDetailDrawer';

export const __experimental_PricingTable = (props: __experimental_PricingTableProps) => {
  const { __experimental_commerce } = useClerk();
  const { mode = 'mounted' } = usePricingTableContext();
  const [planPeriod, setPlanPeriod] = useState<PlanPeriod>('month');
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
    <InternalThemeProvider>
      {plans ? (
        <Box role='table'>
          <Box role='rowgroup'>
            <Box
              role='row'
              sx={t => ({
                display: 'grid',
                gridTemplateColumns: `repeat(${plans.length + 1}, minmax(0,1fr))`,
              })}
            >
              <Box
                role='columnheader'
                sx={t => ({
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                })}
              >
                <SegmentedControl.Root
                  aria-label='Set pay period'
                  value={planPeriod}
                  onChange={value => setPlanPeriod(value as PlanPeriod)}
                >
                  <SegmentedControl.Button
                    value='month'
                    // TODO(@Commerce): needs localization
                    text='Monthly'
                  />
                  <SegmentedControl.Button
                    value='annual'
                    // TODO(@Commerce): needs localization
                    text='Annually'
                  />
                </SegmentedControl.Root>
              </Box>
              {plans?.map(plan => (
                <Box
                  key={plan.slug}
                  role='columnheader'
                >
                  <PlanCardHeader
                    plan={plan}
                    planPeriod={planPeriod}
                  />
                </Box>
              ))}
            </Box>
          </Box>
          <Box role='rowgroup'>
            <Box
              role='row'
              sx={t => ({
                display: 'grid',
                gridTemplateColumns: `repeat(${plans.length + 1}, minmax(0,1fr))`,
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$neutralAlpha100,
                ':hover': {
                  backgroundColor: t.colors.$neutralAlpha25,
                },
              })}
            >
              <Box
                role='cell'
                sx={t => ({
                  padding: t.space.$4,
                })}
              >
                <Text>Feature 1</Text>
              </Box>
              {plans.map((_, i) => (
                <Box
                  key={i}
                  role='cell'
                  sx={t => ({
                    display: 'grid',
                    placeContent: 'center',
                    padding: t.space.$4,
                  })}
                >
                  <Icon
                    icon={Check}
                    colorScheme='neutral'
                    size='sm'
                  />
                </Box>
              ))}
            </Box>
            <Box
              role='row'
              sx={t => ({
                display: 'grid',
                gridTemplateColumns: `repeat(${plans.length + 1}, minmax(0,1fr))`,
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$neutralAlpha100,
                ':hover': {
                  backgroundColor: t.colors.$neutralAlpha25,
                },
              })}
            >
              <Box
                role='cell'
                sx={t => ({
                  padding: t.space.$4,
                })}
              >
                <Text>Feature 1</Text>
              </Box>
              {plans.map((_, i) => (
                <Box
                  key={i}
                  role='cell'
                  sx={t => ({
                    display: 'grid',
                    placeContent: 'center',
                    padding: t.space.$4,
                  })}
                >
                  <Icon
                    icon={Check}
                    colorScheme='neutral'
                    size='sm'
                  />
                </Box>
              ))}
            </Box>
            <Box
              role='row'
              sx={t => ({
                display: 'grid',
                gridTemplateColumns: `repeat(${plans.length + 1}, minmax(0,1fr))`,
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$neutralAlpha100,
                ':hover': {
                  backgroundColor: t.colors.$neutralAlpha25,
                },
              })}
            >
              <Box
                role='cell'
                sx={t => ({
                  padding: t.space.$4,
                })}
              >
                <Text>Feature 1</Text>
              </Box>
              {plans.map((_, i) => (
                <Box
                  key={i}
                  role='cell'
                  sx={t => ({
                    display: 'grid',
                    placeContent: 'center',
                    padding: t.space.$4,
                  })}
                >
                  <Icon
                    icon={Check}
                    colorScheme='neutral'
                    size='sm'
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ) : null}

      <br />
      <br />
      <br />
      <br />

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
    </InternalThemeProvider>
  );
};
