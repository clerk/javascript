import type { BillingSubscriptionPlanPeriod } from '@clerk/shared/types';
import type { MouseEvent } from 'react';

import { usePlans, usePlansContext } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import type { PricingTableMatrixData } from './pricing-table-matrix.types';

export interface PricingTableMatrixProps {
  planIds: string[];
  highlightedPlan?: string;
  planPeriod: BillingSubscriptionPlanPeriod;
  setPlanPeriod: (val: BillingSubscriptionPlanPeriod) => void;
  onSelect: (planId: string, event?: MouseEvent<HTMLElement>) => void;
}

export const usePricingTableMatrixModel = ({
  planIds,
  highlightedPlan,
  planPeriod,
  setPlanPeriod,
  onSelect,
}: PricingTableMatrixProps): PricingTableMatrixData => {
  const { data: resources } = usePlans({ mode: 'cache', keepPreviousData: false });
  const plans = planIds.flatMap(id => {
    const plan = resources.find(item => item.id === id);
    return plan ? [plan] : [];
  });
  const { buttonPropsForPlan } = usePlansContext();
  const { t, $ } = useLocalizations();
  const renderBillingCycleControls = plans.some(plan => Boolean(plan.annualMonthlyFee));
  const features = (() => {
    const featuresSet = new Set<string>();
    plans.forEach(({ features: planFeatures }) => {
      planFeatures.forEach(({ name }) => featuresSet.add(name));
    });
    return Array.from(featuresSet);
  })();

  return {
    renderBillingCycleControls,
    features,
    includedLabel: t(localizationKeys('billing.pricingTable.included')),
    highlightedPlan,
    planPeriod,
    setPlanPeriod,
    plans: plans.map(plan => {
      const planId = plan.id;
      const planFee = !plan.annualMonthlyFee ? plan.fee : planPeriod === 'annual' ? plan.annualMonthlyFee : plan.fee;

      return {
        onSelect: (event?: MouseEvent<HTMLElement>) => onSelect(planId, event),
        slug: plan.slug,
        avatarUrl: plan.avatarUrl,
        name: plan.name,
        hasBaseFee: plan.hasBaseFee,
        hasAnnualMonthlyFee: !!plan.annualMonthlyFee,
        isDefault: plan.isDefault,
        feeText: plan.hasBaseFee ? $(planFee as NonNullable<typeof planFee>) : null,
        buttonProps: plan.isDefault ? null : buttonPropsForPlan({ plan, selectedPlanPeriod: planPeriod }),
        featureNames: plan.features.map(feature => feature.name),
      };
    }),
  };
};
