import type { MouseEvent, RefObject } from 'react';

import type { CheckoutCtx } from '@/ui/types';

import type { LocalizationKey } from '../../localization';

export type CheckoutData = {
  subscriberType: 'user' | 'organization';
  checkoutContextValue: CheckoutCtx;
};

export type CheckoutGenericErrorData = {
  message: string | undefined;
};

export type CheckoutInvalidPlanData =
  | { status: 'hidden' }
  | {
      status: 'ready';
      planName: string;
      isAnnual: boolean;
      isMonthly: boolean;
      currencySymbol: string;
      amountFormatted: string;
      annualMonthlyAmountFormatted: string;
      isPlanUpgradePossible: boolean;
    };

export type CheckoutFormData = {
  planName: string;
  showFreeTrialBadge: boolean;
  isAnnual: boolean;
  baseFeeText: string | null;
  paidSeats: { quantity: number; amountText: string } | null;
  proratedDiscountText: string | null;
  proratedCreditText: string | null;
  accountCreditsText: string | null;
  pastDueText: string | null;
  trialTotal: { days: number; amountText: string } | null;
  periodTotalText: string | null;
  totalDueNowText: string | null;
  renewalTotalText: string | null;
  showDowngradeInfo: boolean;
  descriptionElements: LocalizationKey[];
};

export type CheckoutCompleteModel = {
  hasTotals: boolean;
  hasTotalDueNow: boolean;
  isPayment: boolean;
  hasFreeTrial: boolean;
  showPaymentMethod: boolean;
  totalPaidText: string;
  freeTrialEndText: string;
  paymentOrStartText: string;
  navigateOnClose: () => void;
};

export type CheckoutCompleteData = Omit<CheckoutCompleteModel, 'navigateOnClose'> & {
  isMotionSafe: boolean;
  canHover: boolean;
  mousePosition: { x: number; y: number };
  checkoutSuccessRootRef: RefObject<HTMLSpanElement>;
  handleMouseMove: (event: MouseEvent<HTMLSpanElement>) => void;
  handleClose: () => void;
};
