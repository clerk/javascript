import type { SignInButtonProps, SignInProps } from '@clerk/shared/types';
import React from 'react';

import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk, type WithClerkProp } from './utils';

export type { SignInButtonProps };

export const SignInButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<SignInButtonProps>>) => {
    const { signUpFallbackRedirectUrl, forceRedirectUrl, fallbackRedirectUrl, signUpForceRedirectUrl, mode, ...rest } =
      props;
    children = normalizeWithDefaultValue(children, 'Sign in');
    const child = assertSingleChild(children)('SignInButton');

    const clickHandler = () => {
      const opts: SignInProps = {
        forceRedirectUrl,
        fallbackRedirectUrl,
        signUpFallbackRedirectUrl,
        signUpForceRedirectUrl,
      };

      if (!clerk) {
        return;
      }

      if (mode === 'modal') {
        return clerk.openSignIn({ ...opts, appearance: props.appearance });
      }
      return clerk.redirectToSignIn({
        ...opts,
        signInFallbackRedirectUrl: fallbackRedirectUrl,
        signInForceRedirectUrl: forceRedirectUrl,
      });
    };

    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      if (child && typeof child === 'object' && 'props' in child) {
        await safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  'SignInButton',
);
