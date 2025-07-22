import type { __internal_PlanDetailsProps } from '@clerk/types';
import React from 'react';

import type { WithClerkProp } from '../types';
import { assertSingleChild, normalizeWithDefaultValue, safeExecute } from '../utils';
import { withClerk } from './withClerk';

export type { __internal_PlanDetailsProps };

export const PlanDetailsButton = withClerk(
  ({ clerk, children, ...props }: WithClerkProp<React.PropsWithChildren<__internal_PlanDetailsProps>>) => {
    const { plan, planId, appearance, initialPlanPeriod, portalId, portalRoot, ...rest } = props;
    children = normalizeWithDefaultValue(children, 'Plan details');
    const child = assertSingleChild(children)('PlanDetailsButton');

    const clickHandler = () => {
      if (!clerk) {
        return;
      }

      return clerk.__internal_openPlanDetails({
        plan,
        planId,
        appearance,
        initialPlanPeriod,
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
  { component: 'PlanDetailsButton', renderWhileLoading: true },
);
