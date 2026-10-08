import { Flow } from '@/ui/customizables/Flow';

import type { PricingTableViewProps } from './pricing-table.types';

export const PricingTableView = ({ isFlowReady, useMatrix, matrix, cards }: PricingTableViewProps) => (
  <Flow.Root
    flow='pricingTable'
    isFlowReady={isFlowReady}
    sx={{ width: '100%' }}
  >
    {useMatrix ? matrix : cards}
  </Flow.Root>
);
