import React from 'react';

import { SignUpButtonProps, WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export const SignUpButton = withClerk(({ clerk, children, ...props }: WithClerkProp<SignUpButtonProps>) => {
  const { afterSignInUrl, afterSignUpUrl, redirectUrl, mode, ...rest } = props;

  children = normalizeWithDefaultValue(children, 'Sign up');
  const child = assertSingleChild(children)('SignUpButton');

  const clickHandler = () => {
    const opts = { afterSignInUrl, afterSignUpUrl, redirectUrl };
    if (mode === 'modal') {
      return clerk.openSignUp(opts);
    }
    return clerk.redirectToSignUp(opts);
  };

  const wrappedChildClickHandler: React.MouseEventHandler = async e => {
    await safeExecute((child as any).props.onClick)(e);
    return clickHandler();
  };

  const childProps = { ...rest, onClick: wrappedChildClickHandler };
  return React.cloneElement(child as React.ReactElement<unknown>, childProps);
}, 'SignUpButton');
