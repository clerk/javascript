import type { __experimental_SubscriptionDetailsButtonProps } from '@clerk/types';
import React from 'react';

import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk } from './utils';
import type { WithClerkProp } from './utils';

export type { __experimental_SubscriptionDetailsButtonProps as SubscriptionDetailsButtonProps };

export const SubscriptionDetailsButton = withClerk(
  ({
    clerk,
    children,
    ...props
  }: WithClerkProp<React.PropsWithChildren<__experimental_SubscriptionDetailsButtonProps>>) => {
    const { for: _for, subscriptionDetailsProps, onSubscriptionCancel, ...rest } = props;
    children = normalizeWithDefaultValue(children, 'Subscription details');
    const child = assertSingleChild(children)('SubscriptionDetailsButton');

    // Note: Auth checks are moved to runtime since Astro React components
    // don't have access to auth context at render time like Vue/React apps do

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      return clerk.__internal_openSubscriptionDetails({
        for: _for,
        onSubscriptionCancel,
        ...subscriptionDetailsProps,
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
  'SubscriptionDetailsButton',
);
