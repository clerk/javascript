import type { __experimental_PlanDetailsButtonProps, __internal_PlanDetailsProps } from '@clerk/types';
import React from 'react';

import type { WithClerkProp } from './utils';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk } from './utils';
import { mergePortalProps, normalizePortalRoot } from './portalProps';

export type { __experimental_PlanDetailsButtonProps as PlanDetailsButtonProps };

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

    const wrappedChildClickHandler: React.MouseEventHandler = e => {
      if (child && typeof child === 'object' && 'props' in child) {
        void safeExecute(child.props.onClick)(e);
      }
      return clickHandler();
    };

    const childProps = { ...rest, onClick: wrappedChildClickHandler };
    return React.cloneElement(child as React.ReactElement<unknown>, childProps);
  },
  'PlanDetailsButton',
);
