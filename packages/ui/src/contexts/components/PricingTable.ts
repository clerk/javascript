import { createContext, useContext } from 'react';

import type { PricingTableCtx } from '../../types';

export const PricingTableContext = createContext<PricingTableCtx | null>(null);

export const usePricingTableContext = () => {
  const context = useContext(PricingTableContext);

  if (!context || context.componentName !== 'PricingTable') {
    throw new Error('Clerk: usePricingTableContext called outside PricingTable.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
