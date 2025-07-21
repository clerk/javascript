import type { __internal_CheckoutProps } from '@clerk/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export type { __internal_CheckoutProps };

export const CheckoutButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<__internal_CheckoutProps>>) => {
    // const { signUpFallbackRedirectUrl, forceRedirectUrl, fallbackRedirectUrl, signUpForceRedirectUrl, mode, ...rest } =
    //   props;
    children = normalizeWithDefaultValue(children, 'Checkout');
    const child = assertSingleChild(children)('CheckoutButton');

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      return clerk.__internal_openCheckout(props);

      // if (mode === 'modal') {
      //   return clerk.openSignIn({ ...opts, appearance: props.appearance });
      // }
      // return clerk.redirectToSignIn({
      //   ...opts,
      //   signInFallbackRedirectUrl: fallbackRedirectUrl,
      //   signInForceRedirectUrl: forceRedirectUrl,
      // });
    };

    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      if (child && typeof child === 'object' && 'props' in child) {
        await safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };

    const childProps = { ...props, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  'SignInButton',
);
