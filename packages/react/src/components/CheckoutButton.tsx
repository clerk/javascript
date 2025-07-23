import type { __experimental_CheckoutButtonProps } from '@clerk/types';
import React from 'react';

import { useAuth } from '../hooks';
import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

/**
 * @experimental A button component that opens the Clerk Checkout drawer when clicked. This component must be rendered
 * inside a `<SignedIn />` component to ensure the user is authenticated.
 *
 * @example
 * ```tsx
 * import { SignedIn } from '@clerk/clerk-react';
 * import { CheckoutButton } from '@clerk/clerk-react/experimental';
 *
 * // Basic usage with default "Checkout" text
 * function BasicCheckout() {
 *   return (
 *     <SignedIn>
 *       <CheckoutButton planId="plan_123" />
 *     </SignedIn>
 *   );
 * }
 *
 * // Custom button with organization subscription
 * function OrganizationCheckout() {
 *   return (
 *     <SignedIn>
 *       <CheckoutButton
 *         planId="plan_123"
 *         planPeriod="month"
 *         subscriberType="org"
 *         onSubscriptionComplete={() => console.log('Subscription completed!')}
 *       >
 *         <button className="custom-button">Subscribe Now</button>
 *       </CheckoutButton>
 *     </SignedIn>
 *   );
 * }
 * ```
 *
 * @throws {Error} When rendered outside of a `<SignedIn />` component
 * @throws {Error} When `subscriberType="org"` is used without an active organization context
 */
export const CheckoutButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<__experimental_CheckoutButtonProps>>) => {
    const { planId, planPeriod, subscriberType, onSubscriptionComplete, newSubscriptionRedirectUrl, drawer, ...rest } =
      props;

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
        planId,
        planPeriod,
        subscriberType,
        onSubscriptionComplete,
        newSubscriptionRedirectUrl,
        ...drawer,
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
