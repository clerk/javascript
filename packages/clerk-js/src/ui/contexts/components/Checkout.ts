import { createContext, useContext } from 'react';

import type { __experimental_CheckoutCtx } from '../../types';

export const __experimental_CheckoutContext = createContext<__experimental_CheckoutCtx | null>(null);

export const useCheckoutContext = () => {
  const context = useContext(__experimental_CheckoutContext);

  if (!context || context.componentName !== 'Checkout') {
    throw new Error('Clerk: useCheckoutContext called outside Checkout.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
