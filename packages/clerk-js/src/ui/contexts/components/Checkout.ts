import { useClerk } from '@clerk/shared/react';
import { createContext, useContext, useMemo } from 'react';

import { isAllowedRedirect } from '../../../utils';
// import { useAppearance } from '../../customizables';
// import { usePrefersReducedMotion } from '../../hooks';
import type { CheckoutCtx } from '../../types';
import { useOptions } from '../OptionsContext';

function invariant(cond: any, msg: string): asserts cond {
  if (!cond) {
    throw Error(msg);
  }
}

export const CheckoutContext = createContext<CheckoutCtx | null>(null);

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  const clerk = useClerk();
  const options = useOptions();

  // const prefersReducedMotion = usePrefersReducedMotion();
  // const { animations: layoutAnimations } = useAppearance().parsedLayout;
  // const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

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

  const subscriber = () => {
    if (ctx.subscriberType === 'org' && clerk.organization) {
      invariant(clerk.organization, 'Clerk: subscriberType is "org" but no active organization was found');

      return clerk.organization;
    }

    invariant(clerk.user, 'Clerk: no active user found');

    return clerk.user;
  };

  return {
    ...ctx,
    componentName,
    newSubscriptionRedirectUrl,
    subscriber,
    // isMotionSafe,
  };
};
