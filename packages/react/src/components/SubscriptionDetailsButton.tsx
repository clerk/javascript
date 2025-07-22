import type { __internal_SubscriptionDetailsProps } from '@clerk/types';
import React from 'react';

import { useAuth } from '../hooks';
import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export type { __internal_SubscriptionDetailsProps };

export const SubscriptionDetailsButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<__internal_SubscriptionDetailsProps>>) => {
    const { for: forProp, appearance, onSubscriptionCancel, portalId, portalRoot, ...rest } = props;
    children = normalizeWithDefaultValue(children, 'Subscription details');
    const child = assertSingleChild(children)('SubscriptionDetailsButton');

    const { userId, orgId } = useAuth();

    if (userId === null) {
      throw new Error('Ensure that `<SubscriptionDetailsButton />` is rendered inside a `<SignedIn />` component.');
    }

    if (orgId === null && forProp === 'org') {
      throw new Error(
        'Wrap `<SubscriptionDetailsButton for="organization" />` with a check for an active organization.',
      );
    }

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      return clerk.__internal_openSubscriptionDetails({
        for: forProp,
        appearance,
        onSubscriptionCancel,
        portalId,
        portalRoot,
      });
    };

    const wrappedChildClickHandler: React.MouseEventHandler = async e => {
      if (child && typeof child === 'object' && 'props' in child) {
        await safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  { component: 'SubscriptionDetailsButton', renderWhileLoading: true },
);
