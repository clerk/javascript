import type { __internal_SubscriptionDetailsProps } from '@clerk/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export type { __internal_SubscriptionDetailsProps };

export const SubscriptionDetailsButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<__internal_SubscriptionDetailsProps>>) => {
    // const { signUpFallbackRedirectUrl, forceRedirectUrl, fallbackRedirectUrl, signUpForceRedirectUrl, mode, ...rest } =
    //   props;
    children = normalizeWithDefaultValue(children, 'Subscription details');
    const child = assertSingleChild(children)('SubscriptionDetailsButton');

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      return clerk.__internal_openSubscriptionDetails(props);

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
