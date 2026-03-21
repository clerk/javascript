import { deprecated } from '@clerk/shared/deprecated';
import type { SignOutOptions } from '@clerk/shared/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export type SignOutButtonProps = {
  redirectUrl?: string;
  sessionId?: string;
  /**
   * @deprecated Use the `redirectUrl` and `sessionId` props directly instead.
   */
  signOutOptions?: SignOutOptions;
  children?: React.ReactNode;
};

export const SignOutButton = withClerk(
  ({ clerk, children, ...props }: React.PropsWithChildren<WithClerkProp<SignOutButtonProps>>) => {
    const { redirectUrl = '/', sessionId, signOutOptions, getContainer, component, ...rest } = props;

    if (signOutOptions) {
      deprecated('SignOutButton `signOutOptions`', 'Use the `redirectUrl` and `sessionId` props directly instead.');
    }

    children = normalizeWithDefaultValue(children, 'Sign out');
    const child = assertSingleChild(children)('SignOutButton');

    const clickHandler = () =>
      clerk.signOut({
        redirectUrl,
        ...(sessionId !== undefined && { sessionId }),
        ...signOutOptions,
      });
    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      await safeExecute((child as any).props.onClick)(e);
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  { component: 'SignOutButton', renderWhileLoading: true },
);
