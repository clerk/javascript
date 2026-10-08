import type { BillingSubscriptionPlanPeriod } from '@clerk/shared/types';
import { useState } from 'react';

import type { usePlanDetailsModel } from './plan-details.model';

export const usePlanDetailsPeriodController = (initialPlanPeriod?: BillingSubscriptionPlanPeriod) => {
  const [planPeriod, setPlanPeriod] = useState<BillingSubscriptionPlanPeriod>(initialPlanPeriod ?? 'month');

  return { planPeriod, setPlanPeriod };
};

export const usePlanDetailsController = (
  model: ReturnType<typeof usePlanDetailsModel>,
  period: ReturnType<typeof usePlanDetailsPeriodController>,
) => {
  return {
    ...model,
    ...period,
  };
};
