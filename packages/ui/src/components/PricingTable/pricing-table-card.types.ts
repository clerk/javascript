import type { MouseEvent, ReactNode } from 'react';

import type { LocalizationKey } from '../../customizables';

export type PricingPlanPeriod = 'month' | 'annual';

export type PricingTableCardHeaderData = {
  name: string;
  description: string | null;
  isDefault: boolean;
  hasMonthlyFee: boolean;
  hasAnnualMonthlyFee: boolean;
  feePeriodText: LocalizationKey;
  feeFormatted: string;
};

export type PricingTableCardHeaderProps = PricingTableCardHeaderData & {
  isCompact: boolean;
  planPeriod: PricingPlanPeriod;
  setPlanPeriod: (period: PricingPlanPeriod) => void;
  badge?: ReactNode;
};

export type PricingTableSeatRow = {
  elementId: string;
  icon: 'user' | 'users';
  text: LocalizationKey;
  additionalText?: LocalizationKey;
  additionalTooltipText?: string;
};

export type PricingTableSeatCostData = {
  seatRows: PricingTableSeatRow[] | null;
};

export type PricingTableCardData = {
  id: string;
  slug: string;
  highlighted?: boolean;
  planPeriod: PricingPlanPeriod;
  setPlanPeriod: (period: PricingPlanPeriod) => void;
  selectPlan: (event: MouseEvent<HTMLElement>) => void;
  showPlanDetails: (event?: MouseEvent<HTMLElement>) => void;
  header: PricingTableCardHeaderData;
  seatCost: PricingTableSeatCostData;
  isCompact: boolean;
  hasFeatures: boolean;
  hasSeatFeatures: boolean;
  hasMoreFeatures: boolean;
  features: { id: string; slug: string; name: string }[];
  showSeatCost: boolean;
  ctaPosition: 'top' | 'bottom';
  collapseFeatures: boolean;
  shouldShowFooter: boolean;
  shouldShowFooterNotice: boolean;
  subscriptionStatus: 'active' | 'ended' | 'upcoming' | 'past_due' | 'free_trial' | null;
  footerNoticeKey: LocalizationKey | null;
  footerButtonProps: {
    localizationKey: LocalizationKey;
    variant: 'bordered' | 'solid';
    colorScheme: 'secondary' | 'primary';
    isDisabled: boolean;
    disabled: boolean;
  } | null;
  footerButtonTooltipText: LocalizationKey | null;
};
