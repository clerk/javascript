import React from 'react';

import { withClerk } from '../contexts';
import { SignOutButtonProps, WithClerkProp } from '../types';
import {
  assertSingleChild,
  normalizeWithDefaultValue,
  safeExecute,
} from '../utils';

export const SignOutButton = withClerk(
  ({
    clerk,
    children,
    ...props
  }: React.PropsWithChildren<WithClerkProp<SignOutButtonProps>>) => {
    const { signOutCallback, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Sign out');
    const child = assertSingleChild(children)('SignOutButton');

    const clickHandler = () => {
      return clerk.signOutOne(signOutCallback);
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
