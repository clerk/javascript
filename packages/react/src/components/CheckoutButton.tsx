import type { __internal_CheckoutProps } from '@clerk/types';
import React from 'react';

import { useAuth } from '../hooks';
import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export type { __internal_CheckoutProps };

export const CheckoutButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<__internal_CheckoutProps>>) => {
    const {
      appearance,
      planId,
      planPeriod,
      subscriberType,
      onSubscriptionComplete,
      portalId,
      portalRoot,
      newSubscriptionRedirectUrl,
      onClose,
      ...rest
    } = props;

    const { userId, orgId } = useAuth();

    if (userId === null) {
      throw new Error('Ensure that `<CheckoutButton />` is rendered inside a `<SignedIn />` component.');
    }

    if (orgId === null && subscriberType === 'org') {
      throw new Error('Wrap `<CheckoutButton for="organization" />` with a check for an active organization.');
    }

    children = normalizeWithDefaultValue(children, 'Checkout');
    const child = assertSingleChild(children)('CheckoutButton');

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      return clerk.__internal_openCheckout({
        appearance,
        planId,
        planPeriod,
        subscriberType,
        onSubscriptionComplete,
        portalId,
        portalRoot,
        newSubscriptionRedirectUrl,
        onClose,
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
  { component: 'CheckoutButton', renderWhileLoading: true },
);
