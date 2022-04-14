import React from 'react';

import { SignInWithMetamaskButtonProps, WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export const SignInWithMetamaskButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<SignInWithMetamaskButtonProps>) => {
    const { redirectUrl, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Sign in with Metamask');
    const child = assertSingleChild(children)('SignInWithMetamaskButton');

    const clickHandler = async () => {
      async function authenticate() {
        await clerk.authenticateWithMetamask({ redirectUrl });
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
  'SignInWithMetamask',
);
