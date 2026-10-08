import { __internal_usePlanDetailsQuery } from '@clerk/shared/react/index';
import type { __internal_PlanDetailsProps, BillingSubscriptionPlanPeriod } from '@clerk/shared/types';
import { useMemo } from 'react';

import { useLocalizations } from '../../customizables';

export const usePlanDetailsModel = (
  { planId, plan: initialPlan }: __internal_PlanDetailsProps,
  planPeriod: BillingSubscriptionPlanPeriod,
) => {
  const { $, translateError } = useLocalizations();
  const {
    data: plan,
    isLoading,
    error,
  } = __internal_usePlanDetailsQuery({
    planId,
    initialPlan,
    enabled: Boolean(planId || initialPlan?.id),
  });
  const fee = useMemo(() => {
    if (!plan?.annualMonthlyFee) {
      return plan?.fee;
    }
    return planPeriod === 'annual' ? plan.annualMonthlyFee : plan.fee;
  }, [plan, planPeriod]);
  const feeFormatted = useMemo(() => {
    if (!fee) {
      return '';
    }
    return $(fee, { style: 'short' });
  }, [fee, $]);

  return {
    isLoading: isLoading && !initialPlan,
    hasError: !plan && !!error,
    errorMessage: !plan && error ? translateError(error.errors[0]) : null,
    plan: plan
      ? {
          payerType: plan.forPayerType === 'org' ? ('organization' as const) : ('user' as const),
          avatarUrl: plan.avatarUrl,
          name: plan.name,
          description: plan.description,
          feeFormatted,
          hasMonthlyFee: !!plan.fee,
          hasAnnualMonthlyFee: !!plan.annualMonthlyFee,
          isDefault: plan.isDefault,
          features: plan.features.map(feature => ({
            id: feature.id,
            avatarUrl: feature.avatarUrl,
            name: feature.name,
            description: feature.description,
          })),
        }
      : null,
  };
};
