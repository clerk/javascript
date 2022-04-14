import { SignOutCallback, SignOutOptions } from '@clerk/types';
import React from 'react';

import { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export type SignOutButtonProps = {
  signOutCallback?: SignOutCallback;
  signOutOptions?: SignOutOptions;
  children?: React.ReactNode;
};

export const SignOutButton = withClerk(
  ({ clerk, children, ...props }: React.PropsWithChildren<WithClerkProp<SignOutButtonProps>>) => {
    const { signOutCallback, signOutOptions, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Sign out');
    const child = assertSingleChild(children)('SignOutButton');

    const clickHandler = () => {
      return clerk.signOut(signOutCallback, signOutOptions);
    };

    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      await safeExecute((child as any).props.onClick)(e);
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  'SignOutButton',
);
