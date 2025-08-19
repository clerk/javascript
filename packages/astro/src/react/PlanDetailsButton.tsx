import type { __experimental_PlanDetailsButtonProps } from '@clerk/types';
import React from 'react';

import { assertSingleChild, normalizeWithDefaultValue, safeExecute, withClerk } from './utils';
import type { WithClerkProp } from './utils';

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
  'PlanDetailsButton',
);
