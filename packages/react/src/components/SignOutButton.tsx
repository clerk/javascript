import type { SignOutOptions } from '@clerk/shared/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export type SignOutButtonProps = {
  redirectUrl?: string;
  signOutOptions?: SignOutOptions;
  children?: React.ReactNode;
};

export const SignOutButton = withClerk(
  ({ clerk, children, ...props }: React.PropsWithChildren<WithClerkProp<SignOutButtonProps>>) => {
    const { redirectUrl = '/', signOutOptions, getContainer, component, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Sign out');
    const child = assertSingleChild(children)('SignOutButton');

    const clickHandler = () => clerk.signOut({ redirectUrl, ...signOutOptions });
    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      await safeExecute((child as any).props.onClick)(e);
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  { component: 'SignOutButton', renderWhileLoading: true },
);
