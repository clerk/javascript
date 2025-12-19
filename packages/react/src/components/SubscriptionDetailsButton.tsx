import type { __experimental_SubscriptionDetailsButtonProps } from '@clerk/shared/types';
import React from 'react';

import { useAuth } from '../hooks';
import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

/**
 * A button component that opens the Clerk Subscription Details drawer when clicked. Render only when the user is signed in (e.g., wrap with `<Show when="signed-in">`).
 *
 * @example
 * ```tsx
 * import { Show } from '@clerk/react';
 * import { SubscriptionDetailsButton } from '@clerk/react/experimental';
 *
 * // Basic usage with default "Subscription details" text
 * function BasicSubscriptionDetails() {
 *   return <SubscriptionDetailsButton />;
 * }
 *
 * // Custom button with Organization Subscription
 * function OrganizationSubscriptionDetails() {
 *   return (
 *     <Show when="signed-in">
 *       <SubscriptionDetailsButton
 *         for="organization"
 *         onSubscriptionCancel={() => console.log('Subscription canceled')}
 *       >
 *         <button>View Organization Subscription</button>
 *       </SubscriptionDetailsButton>
 *     </Show>
 *   );
 * }
 * ```
 *
 * @throws {Error} When rendered while the user is signed out
 * @throws {Error} When `for="organization"` is used without an Active Organization context
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export const SubscriptionDetailsButton = withClerk(
  ({
    clerk,
    children,
    ...props
  }: WithClerkProp<React.PropsWithChildren<__experimental_SubscriptionDetailsButtonProps>>) => {
    const { for: _for, subscriptionDetailsProps, onSubscriptionCancel, ...rest } = props;
    children = normalizeWithDefaultValue(children, 'Subscription details');
    const child = assertSingleChild(children)('SubscriptionDetailsButton');

    const { userId, orgId } = useAuth();

    if (userId === null) {
      throw new Error(
        'Clerk: Ensure that `<SubscriptionDetailsButton />` is rendered only when the user is signed in (wrap with `<Show when="signed-in">` or guard with `useAuth()`).',
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
