import type { __experimental_PlanDetailsButtonProps } from '@clerk/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

/**
 * @experimental A button component that opens the Clerk Plan Details drawer when clicked. This component is part of
 * Clerk's Billing feature which is available under a public beta.
 *
 * @example
 * ```tsx
 * import { SignedIn } from '@clerk/clerk-react';
 * import { PlanDetailsButton } from '@clerk/clerk-react/experimental';
 *
 * // Basic usage with default "Plan details" text
 * function BasicPlanDetails() {
 *   return (
 *     <PlanDetailsButton planId="plan_123" />
 *   );
 * }
 *
 * // Custom button with custom text
 * function CustomPlanDetails() {
 *   return (
 *     <PlanDetailsButton planId="plan_123">
 *       <button>View Plan Details</button>
 *     </PlanDetailsButton>
 *   );
 * }
 * ```
 *
 * @see https://clerk.com/docs/billing/overview
 */
export const PlanDetailsButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<__experimental_PlanDetailsButtonProps>>) => {
    const { plan, planId, initialPlanPeriod, planDetailsProps, ...rest } = props;

    children = normalizeWithDefaultValue(children, 'Plan details');
    const child = assertSingleChild(children)('PlanDetailsButton');

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      return clerk.__internal_openPlanDetails({
        plan,
        planId,
        initialPlanPeriod,
        ...planDetailsProps,
      } as __experimental_PlanDetailsButtonProps);
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
  { component: 'PlanDetailsButton', renderWhileLoading: true },
);
