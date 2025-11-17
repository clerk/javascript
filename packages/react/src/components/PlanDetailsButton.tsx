import type { __experimental_PlanDetailsButtonProps, __internal_PlanDetailsProps } from '@clerk/shared/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import {
  assertSingleChild,
  mergePortalProps,
  normalizePortalRoot,
  normalizeWithDefaultValue,
  safeExecute,
} from '../utils';
import { withClerk } from './withClerk';

/**
 * A button component that opens the Clerk Plan Details drawer when clicked. This component is part of
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
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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

      // Merge portal config: top-level props take precedence over nested planDetailsProps
      // Note: planDetailsProps.portalRoot is PortalRoot (HTMLElement | null | undefined) which is
      // incompatible with PortalProps.portalRoot, so we handle portalRoot separately
      const topLevelPortalConfig = mergePortalProps(props);

      // Get portalRoot from top-level props first, then fallback to planDetailsProps
      const portalRootValue = topLevelPortalConfig.portalRoot
        ? normalizePortalRoot(topLevelPortalConfig.portalRoot)
        : (planDetailsProps?.portalRoot ?? undefined);

      // Build the props object respecting the discriminated union (planId XOR plan)
      const planDetailsCallProps: __internal_PlanDetailsProps = plan
        ? {
            plan,
            initialPlanPeriod,
            appearance: planDetailsProps?.appearance,
            portalId: topLevelPortalConfig.portalId ?? planDetailsProps?.portalId,
            portalRoot: portalRootValue,
          }
        : {
            planId: planId!,
            initialPlanPeriod,
            appearance: planDetailsProps?.appearance,
            portalId: topLevelPortalConfig.portalId ?? planDetailsProps?.portalId,
            portalRoot: portalRootValue,
          };

      return clerk.__internal_openPlanDetails(planDetailsCallProps);
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
