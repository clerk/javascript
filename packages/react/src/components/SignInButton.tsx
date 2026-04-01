import type { SignInButtonProps, SignInProps } from '@clerk/shared/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export const SignInButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<SignInButtonProps>>) => {
    const {
      // @ts-expect-error - appearance is a valid prop for SignInProps & SignInButtonPropsModal
      appearance,
      getContainer,
      component,
      signUpFallbackRedirectUrl,
      forceRedirectUrl,
      fallbackRedirectUrl,
      signUpForceRedirectUrl,
      mode,
      initialValues,
      withSignUp,
      oauthFlow,
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
        oauthFlow,
      };

      if (mode === 'modal') {
        return clerk.openSignIn({ ...opts, appearance, getContainer });
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
