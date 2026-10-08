import type { BillingSubscriptionStatus } from '@clerk/shared/types';
import type { MouseEvent } from 'react';

import type { LocalizationKey } from '../../customizables';

export type SubscriptionsListProps = {
  title: LocalizationKey;
  switchPlansLabel: LocalizationKey;
  newSubscriptionLabel: LocalizationKey;
  manageSubscriptionLabel: LocalizationKey;
};

export type SubscriptionListItem = {
  id: string;
  name: string;
  status: BillingSubscriptionStatus;
  showBadge: boolean;
  badgeStatus: BillingSubscriptionStatus | 'free_trial';
  caption: LocalizationKey | null;
  feeText: string;
  hasFee: boolean;
  isAnnual: boolean;
  seats: { limitAndIncludedLabel: LocalizationKey | null; paidUsage: string | null } | null;
  discount: {
    title: string;
    cyclesRemaining: number | null;
    periodLabel: string | null;
    amount: string | null;
  } | null;
};

export type SubscriptionsListData = {
  localizationRoot: 'userProfile' | 'organizationProfile';
  isLoading: boolean;
  billingPlansExist: boolean;
  isManageButtonVisible: boolean;
  onManage: (event?: MouseEvent<HTMLElement>) => void;
  onSwitchPlans: () => void;
  items: SubscriptionListItem[];
  overview: { amount: string; date: Date } | null;
};
