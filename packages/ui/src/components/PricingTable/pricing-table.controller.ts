import { useEffect, useState } from 'react';

import type { PricingTableData, PricingTableModel } from './pricing-table.types';
import type { PricingPlanPeriod } from './pricing-table-card.types';

export const usePricingTableController = (model: PricingTableModel): PricingTableData => {
  const [planPeriod, setPlanPeriod] = useState<PricingPlanPeriod>(model.defaultPlanPeriod);

  useEffect(() => {
    setPlanPeriod(model.defaultPlanPeriod);
  }, [model.defaultPlanPeriod]);

  return {
    isFlowReady: model.isFlowReady,
    useMatrix: model.useMatrix,
    highlightedPlan: model.highlightedPlan,
    isCompact: model.isCompact,
    planPeriod,
    setPlanPeriod,
    selectPlan: (planId, event) => {
      model.selectPlan(planId, planPeriod, event);
    },
    showPlanDetails: (planId, event) => {
      model.showPlanDetails(planId, planPeriod, event);
    },
  };
};
