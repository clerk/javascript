import { multipleChildrenInButtonComponent } from '@clerk/utils';
import React from 'react';

export const assertSingleChild =
  (children: React.ReactNode) =>
  (name: 'SignInButton' | 'SignUpButton' | 'SignOutButton' | 'SignInWithMetamaskButton') => {
    try {
      return React.Children.only(children);
    } catch (e) {
      throw new Error(multipleChildrenInButtonComponent(name));
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any) => {
    if (cb && typeof cb === 'function') {
      return cb(...args);
    }
  };
