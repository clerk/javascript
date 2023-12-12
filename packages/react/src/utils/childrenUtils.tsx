import React from 'react';

import { multipleChildrenInButtonComponent } from '../errors/messages';
import { errorThrower } from './errorThrower';

export const assertSingleChild =
  (children: React.ReactNode) =>
  (name: 'SignInButton' | 'SignUpButton' | 'SignOutButton' | 'SignInWithMetamaskButton') => {
    try {
      return React.Children.only(children);
    } catch (e) {
      return errorThrower.throw(multipleChildrenInButtonComponent(name));
    }
  };

export const normalizeWithDefaultValue = (children: React.ReactNode | undefined, defaultText: string) => {
  if (!children) {
    children = defaultText;
  }
  if (typeof children === 'string') {
    children = <button>{children}</button>;
  }
  return children;
};

export const safeExecute =
  (cb: unknown) =>
  (...args: any) => {
    if (cb && typeof cb === 'function') {
      return cb(...args);
    }
  };
