import { isAllowedRedirect } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import type { CheckoutCtx } from '../../types';
import { useOptions } from '../OptionsContext';

export const CheckoutContext = createContext<CheckoutCtx | null>(null);

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  const clerk = useClerk();
  const options = useOptions();

  if (!context || context.componentName !== 'Checkout') {
    throw new Error('Clerk: useCheckoutContext called outside Checkout.');
  }

  const newSubscriptionRedirectUrl = useMemo(() => {
    // When we're rendered via the PricingTable with mode = 'modal' we provide a `portalRoot` value
    // we want to keep users within the context of the modal, so we do this to prevent navigating away
    if (context.portalRoot) {
      return undefined;
    }

    const url = context.newSubscriptionRedirectUrl || clerk.buildNewSubscriptionRedirectUrl?.();
    return isAllowedRedirect(options?.allowedRedirectOrigins, window.location.origin)(url) ? url : undefined;
  }, [context.portalRoot, context.newSubscriptionRedirectUrl, clerk, options?.allowedRedirectOrigins]);

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
    newSubscriptionRedirectUrl,
  };
};
