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
    // When we're rendered via the PricingTable with mode = 'modal' we provide a `portalRoot` value
    // we want to keep users within the context of the modal, so we do this to prevent navigating away
    if (context.portalRoot) {
      return undefined;
    }

    if (context.__experimental_checkoutContinueUrl) {
      return context.__experimental_checkoutContinueUrl;
    }

    return clerk.__experimental_buildCheckoutContinueUrl?.();
  }, [context.portalRoot, context.__experimental_checkoutContinueUrl, clerk]);

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
    __experimental_checkoutContinueUrl: checkoutContinueUrl,
  };
};
