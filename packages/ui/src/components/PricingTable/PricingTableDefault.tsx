import type { BillingSubscriptionPlanPeriod, PricingTableProps } from '@clerk/shared/types';
import type { MouseEvent } from 'react';

import { Box, descriptors } from '../../customizables';
import { InternalThemeProvider } from '../../styledSystem';
import { PricingTableCard } from './PricingTableCard';

interface PricingTableDefaultProps {
  planIds: string[];
  highlightedPlan?: string;
  planPeriod: BillingSubscriptionPlanPeriod;
  setPlanPeriod: (val: BillingSubscriptionPlanPeriod) => void;
  onSelect: (planId: string, event?: MouseEvent<HTMLElement>) => void;
  onShowDetails: (planId: string, event?: MouseEvent<HTMLElement>) => void;
  isCompact?: boolean;
  props: PricingTableProps;
}

export function PricingTableDefault({
  planIds,
  highlightedPlan,
  planPeriod,
  setPlanPeriod,
  onSelect,
  onShowDetails,
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
          gridTemplateRows: 'auto 1fr',
          gap: `var(--grid-gap-y, var(--grid-gap, ${t.space.$4})) var(--grid-gap, ${t.space.$4})`,
          alignItems: 'stretch',
          width: '100%',
          minWidth: '0',
        })}
        data-variant={isCompact ? 'compact' : 'default'}
      >
        {planIds.map(planId => (
          <PricingTableCard
            key={planId}
            planId={planId}
            highlightedPlan={highlightedPlan}
            planPeriod={planPeriod}
            setPlanPeriod={setPlanPeriod}
            onSelect={onSelect}
            onShowDetails={onShowDetails}
            props={props}
            isCompact={isCompact}
          />
        ))}
      </Box>
    </InternalThemeProvider>
  );
}
