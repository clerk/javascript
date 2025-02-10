import type { SignUpProps } from '@clerk/types';
import React from 'react';

import type { SignUpButtonProps, WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export const SignUpButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<SignUpButtonProps>) => {
    const {
      fallbackRedirectUrl,
      forceRedirectUrl,
      signInFallbackRedirectUrl,
      signInForceRedirectUrl,
      mode,
      unsafeMetadata,
      initialValues,
      ...rest
    } = props;

    children = normalizeWithDefaultValue(children, 'Sign up');
    const child = assertSingleChild(children)('SignUpButton');

    const clickHandler = () => {
      const opts: SignUpProps = {
        fallbackRedirectUrl,
        forceRedirectUrl,
        signInFallbackRedirectUrl,
        signInForceRedirectUrl,
        unsafeMetadata,
        initialValues,
      };

      if (mode === 'modal') {
        return clerk.openSignUp(opts);
      }

      return clerk.redirectToSignUp({
        ...opts,
        signUpFallbackRedirectUrl: fallbackRedirectUrl,
        signUpForceRedirectUrl: forceRedirectUrl,
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
  { component: 'SignUpButton', renderWhileLoading: true },
);
