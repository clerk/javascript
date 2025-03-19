import { __experimental_CommercePlanResource, __experimental_PricingTableProps } from '@clerk/types';
import { Box, descriptors } from '../../customizables';
import { InternalThemeProvider } from '../../styledSystem';
import { PlanCard, PlanPeriod } from './PlanCard';

interface PricingTableDefaultProps {
  plans?: __experimental_CommercePlanResource[] | null;
  highlightedPlan?: __experimental_CommercePlanResource['slug'];
  planPeriod: PlanPeriod;
  setPlanPeriod: (val: PlanPeriod) => void;
  onSelect: (plan: __experimental_CommercePlanResource) => void;
  isCompact?: boolean;
  props: __experimental_PricingTableProps;
}

export function PricingTableDefault({
  plans,
  planPeriod,
  setPlanPeriod,
  onSelect,
  isCompact,
  props,
}: PricingTableDefaultProps) {
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
            onSelect={onSelect}
            props={props}
            isCompact={isCompact}
          />
        ))}
      </Box>
    </InternalThemeProvider>
  );
}
