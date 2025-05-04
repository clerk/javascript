import { useClerk } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import type { __experimental_CheckoutCtx } from '../../types';

export const __experimental_CheckoutContext = createContext<__experimental_CheckoutCtx | null>(null);

export const useCheckoutContext = () => {
  const context = useContext(__experimental_CheckoutContext);
  const clerk = useClerk();

  if (!context || context.componentName !== 'Checkout') {
    throw new Error('Clerk: useCheckoutContext called outside Checkout.');
  }

  const checkoutContinueUrl = useMemo(() => {
    if (context.__experimental_checkoutContinueUrl) {
      return context.__experimental_checkoutContinueUrl;
    }

    return clerk.__experimental_buildCheckoutContinueUrl?.();
  }, [context.__experimental_checkoutContinueUrl, clerk]);

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
    __experimental_checkoutContinueUrl: checkoutContinueUrl,
  };
};
