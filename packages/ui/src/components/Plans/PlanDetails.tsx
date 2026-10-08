import type { __internal_PlanDetailsProps } from '@clerk/shared/types';

import { usePlanDetailsController, usePlanDetailsPeriodController } from './plan-details.controller';
import { usePlanDetailsModel } from './plan-details.model';
import { PlanDetailsView } from './plan-details.view';

export const PlanDetails = (props: __internal_PlanDetailsProps) => {
  const period = usePlanDetailsPeriodController(props.initialPlanPeriod);
  const model = usePlanDetailsModel(props, period.planPeriod);
  const controller = usePlanDetailsController(model, period);
  return <PlanDetailsView controller={controller} />;
};
