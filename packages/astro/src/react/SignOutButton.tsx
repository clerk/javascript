import type { SignOutOptions } from '@clerk/shared/types';
import React from 'react';

import type { WithClerkProp } from './utils';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk } from './utils';

export type SignOutButtonProps = SignOutOptions & {
  children?: React.ReactNode;
};

export const SignOutButton = withClerk(
  ({ clerk, children, ...props }: React.PropsWithChildren<WithClerkProp<SignOutButtonProps>>) => {
    const { redirectUrl = '/', sessionId, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Sign out');
    const child = assertSingleChild(children)('SignOutButton');

    const clickHandler = () => clerk?.signOut({ redirectUrl, sessionId });
    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      if (child && typeof child === 'object' && 'props' in child) {
        await safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  'SignOutButton',
);
