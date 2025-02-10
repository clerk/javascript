import type { SignInProps } from '@clerk/types';
import React from 'react';

import type { SignInButtonProps, WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export const SignInButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<SignInButtonProps>) => {
    const {
      signUpFallbackRedirectUrl,
      forceRedirectUrl,
      fallbackRedirectUrl,
      signUpForceRedirectUrl,
      mode,
      initialValues,
      withSignUp,
      ...rest
    } = props;
    children = normalizeWithDefaultValue(children, 'Sign in');
    const child = assertSingleChild(children)('SignInButton');

    const clickHandler = () => {
      const opts: SignInProps = {
        forceRedirectUrl,
        fallbackRedirectUrl,
        signUpFallbackRedirectUrl,
        signUpForceRedirectUrl,
        initialValues,
        withSignUp,
      };

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
  { component: 'SignInButton', renderWhileLoading: true },
);
