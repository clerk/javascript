import React from 'react';

import { errorThrower } from '../errors/errorThrower';
import { multipleChildrenInButtonComponent } from '../errors/messages';

export const assertSingleChild =
  (children: React.ReactNode) =>
  (
    name:
      | 'SignInButton'
      | 'SignUpButton'
      | 'SignOutButton'
      | 'SignInWithMetamaskButton'
      | 'CheckoutButton'
      | 'SubscriptionDetailsButton'
      | 'PlanDetailsButton',
  ) => {
    try {
      return React.Children.only(children);
    } catch {
      const childArray = React.Children.toArray(children);

      if (childArray.length === 1 && React.isValidElement(childArray[0])) {
        return childArray[0];
      }

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
