import type { SignOutOptions } from '@clerk/types';
import React from 'react';

import type { WithClerkProp } from './utils';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk } from './utils';

export type SignOutButtonProps = {
  redirectUrl?: string;
  signOutOptions?: SignOutOptions;
  children?: React.ReactNode;
};

export const SignOutButton = withClerk(
  ({ clerk, children, ...props }: React.PropsWithChildren<WithClerkProp<SignOutButtonProps>>) => {
    const { redirectUrl = '/', signOutOptions, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Sign out');
    const child = assertSingleChild(children)('SignOutButton');

    const clickHandler = () => clerk?.signOut({ redirectUrl });
    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      await safeExecute(child.props.onClick)(e);
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  'SignOutButton',
);
