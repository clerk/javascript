import { createContext, useContext } from 'react';

import type { __experimental_PricingTableCtx } from '../../types';

export const __experimental_PricingTableContext = createContext<__experimental_PricingTableCtx | null>(null);

export const usePricingTableContext = () => {
  const context = useContext(__experimental_PricingTableContext);

  if (!context || context.componentName !== 'PricingTable') {
    throw new Error('Clerk: usePricingTableContext called outside PricingTable.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
