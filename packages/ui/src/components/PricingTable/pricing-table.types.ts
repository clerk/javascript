import type { MouseEvent, ReactNode } from 'react';

import type { PricingPlanPeriod } from './pricing-table-card.types';

export type PricingTableModel = {
  scopeKey: string;
  isFlowReady: boolean;
  useMatrix: boolean;
  highlightedPlan?: string;
  isCompact: boolean;
  planIds: string[];
  defaultPlanPeriod: PricingPlanPeriod;
  selectPlan: (planId: string, period: PricingPlanPeriod, event?: MouseEvent<HTMLElement>) => boolean;
  showPlanDetails: (planId: string, period: PricingPlanPeriod, event?: MouseEvent<HTMLElement>) => boolean;
};

export type PricingTableData = {
  isFlowReady: boolean;
  useMatrix: boolean;
  highlightedPlan?: string;
  isCompact: boolean;
  planPeriod: PricingPlanPeriod;
  setPlanPeriod: (period: PricingPlanPeriod) => void;
  selectPlan: (planId: string, event?: MouseEvent<HTMLElement>) => void;
  showPlanDetails: (planId: string, event?: MouseEvent<HTMLElement>) => void;
};

export type PricingTableViewProps = {
  isFlowReady: boolean;
  useMatrix: boolean;
  matrix: ReactNode;
  cards: ReactNode;
};
