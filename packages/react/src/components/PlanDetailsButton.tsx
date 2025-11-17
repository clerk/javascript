import type { PlanDetailsButtonProps } from '@clerk/shared/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

/**
 * A button component that opens the Clerk Plan Details drawer when clicked. This component is part of
 * Clerk's Billing feature which is available under a public beta.
 *
 * @example
 * ```tsx
 * import { SignedIn, PlanDetailsButton } from '@clerk/react';
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
 */
export const PlanDetailsButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<PlanDetailsButtonProps>>) => {
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
      } as PlanDetailsButtonProps);
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
