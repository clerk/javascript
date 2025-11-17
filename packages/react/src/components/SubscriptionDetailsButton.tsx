import type { SubscriptionDetailsButtonProps } from '@clerk/shared/types';
import React from 'react';

import { useAuth } from '../hooks';
import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

/**
 * A button component that opens the Clerk Subscription Details drawer when clicked. This component must be rendered inside a `<SignedIn />` component to ensure the user is authenticated.
 *
 * @example
 * ```tsx
 * import { SignedIn, SubscriptionDetailsButton } from '@clerk/react';
 *
 * // Basic usage with default "Subscription details" text
 * function BasicSubscriptionDetails() {
 *   return (
 *     <SubscriptionDetailsButton />
 *   );
 * }
 *
 * // Custom button with organization subscription
 * function OrganizationSubscriptionDetails() {
 *   return (
 *     <SubscriptionDetailsButton
 *       for="organization"
 *       onSubscriptionCancel={() => console.log('Subscription canceled')}
 *     >
 *       <button>View Organization Subscription</button>
 *     </SubscriptionDetailsButton>
 *   );
 * }
 * ```
 *
 * @throws {Error} When rendered outside of a `<SignedIn />` component
 * @throws {Error} When `for="organization"` is used without an active organization context
 */
export const SubscriptionDetailsButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<SubscriptionDetailsButtonProps>>) => {
    const { for: _for, subscriptionDetailsProps, onSubscriptionCancel, ...rest } = props;
    children = normalizeWithDefaultValue(children, 'Subscription details');
    const child = assertSingleChild(children)('SubscriptionDetailsButton');

    const { userId, orgId } = useAuth();

    if (userId === null) {
      throw new Error(
        'Clerk: Ensure that `<SubscriptionDetailsButton />` is rendered inside a `<SignedIn />` component.',
      );
    }

    if (orgId === null && _for === 'organization') {
      throw new Error(
        'Clerk: Wrap `<SubscriptionDetailsButton for="organization" />` with a check for an active organization. Retrieve `orgId` from `useAuth()` and confirm it is defined. For SSR, see: https://clerk.com/docs/reference/backend/types/auth-object#how-to-access-the-auth-object',
      );
    }

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
  { component: 'SubscriptionDetailsButton', renderWhileLoading: true },
);
