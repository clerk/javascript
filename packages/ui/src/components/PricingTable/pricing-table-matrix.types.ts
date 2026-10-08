import type { MouseEvent } from 'react';

import type { PricingPlanPeriod, PricingTableCardData } from './pricing-table-card.types';

export type PricingTableMatrixPlanData = {
  onSelect: (event?: MouseEvent<HTMLElement>) => void;
  slug: string;
  avatarUrl: string | null;
  name: string;
  hasBaseFee: boolean;
  hasAnnualMonthlyFee: boolean;
  isDefault: boolean;
  feeText: string | null;
  buttonProps: PricingTableCardData['footerButtonProps'];
  featureNames: string[];
};

export type PricingTableMatrixData = {
  renderBillingCycleControls: boolean;
  features: string[];
  includedLabel: string;
  highlightedPlan?: string;
  planPeriod: PricingPlanPeriod;
  setPlanPeriod: (period: PricingPlanPeriod) => void;
  plans: PricingTableMatrixPlanData[];
};
