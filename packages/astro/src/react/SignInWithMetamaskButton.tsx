import type { RedirectUrlProp } from '@clerk/types';
import React from 'react';

import type { WithClerkProp } from './utils';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk } from './utils';

export type SignInWithMetamaskButtonProps = RedirectUrlProp & {
  children?: React.ReactNode;
};

export const SignInWithMetamaskButton = withClerk(
  ({ clerk, children, ...props }: React.PropsWithChildren<WithClerkProp<SignInWithMetamaskButtonProps>>) => {
    const { redirectUrl, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Sign in with Metamask');
    const child = assertSingleChild(children)('SignInWithMetamaskButton');

    const clickHandler = () => {
      if (!clerk) {
        return;
      }
      return clerk.authenticateWithMetamask({ redirectUrl: redirectUrl || undefined });
    };

    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      await safeExecute((child as any).props.onClick)(e);
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  'SignInWithMetamaskButton',
);
