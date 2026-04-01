import React from 'react';

import type { SignInWithMetamaskButtonProps, WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export const SignInWithMetamaskButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<SignInWithMetamaskButtonProps>) => {
    const { redirectUrl, getContainer, component, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Sign in with Metamask');
    const child = assertSingleChild(children)('SignInWithMetamaskButton');

    // TODO: Properly fix this code
    // eslint-disable-next-line @typescript-eslint/require-await
    const clickHandler = async () => {
      async function authenticate() {
        await clerk.authenticateWithMetamask({ redirectUrl: redirectUrl || undefined });
      }
      void authenticate();
    };

    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      await safeExecute((child as any).props.onClick)(e);
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  { component: 'SignInWithMetamask', renderWhileLoading: true },
);
