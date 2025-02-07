import { createContext, useContext } from 'react';

import type { CheckoutCtx } from '../../types';

export const CheckoutContext = createContext<CheckoutCtx | null>(null);

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);

  if (!context || context.componentName !== 'Checkout') {
    throw new Error('Clerk: useCheckoutContext called outside Checkout.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
