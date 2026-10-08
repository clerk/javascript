import type { ReactNode } from 'react';

import type { LocalizationKey } from '../../customizables';

export type SubscriptionDetailsModel = {
  subscriptionIds: string[];
  scope: string;
  isLoading: boolean;
  hasSubscription: boolean;
};

export type SubscriptionCancellation = {
  subscriptionId: string | null;
  setSubscriptionId: (id: string | null) => void;
  confirmationOpen: boolean;
  setConfirmationOpen: (open: boolean) => void;
};

export type SubscriptionDetailsViewData = Pick<SubscriptionDetailsModel, 'isLoading' | 'hasSubscription'>;

export type SubscriptionDetailsController = SubscriptionDetailsViewData & { cancellation: SubscriptionCancellation };

export type SubscriptionDetailsSummaryData = {
  billingCycle: LocalizationKey;
  paymentDateLabel: LocalizationKey;
  paymentDate: string;
  paymentAmountLabel: LocalizationKey;
  paymentCurrency: string;
  paymentAmount: string;
};

export type SubscriptionDetailsCardData = {
  planName: string;
  avatarUrl: string | null;
  feeFormatted: string;
  periodText: string;
  badgeStatus: 'active' | 'upcoming' | 'past_due' | 'ended' | 'free_trial';
  hasSeats: boolean;
  seatLimitText: LocalizationKey | null;
  paidSeatsUsageText: string | null;
  pastDueDate: string | null;
  isActive: boolean;
  startedLabel: LocalizationKey;
  startedDate: string;
  endLabel: LocalizationKey;
  endDate: string | null;
  isUpcoming: boolean;
  beginningDate: string;
};

export type SubscriptionDetailsCardViewProps = { controller: SubscriptionDetailsCardData; actions: ReactNode };

export type SubscriptionDetailsActionsModel = {
  subscriptionId: string;
  canRun: (action: 'switch' | 'cancel' | 'resubscribe') => boolean;
  canManageBilling: boolean;
  isSwitchable: boolean;
  isCancellable: boolean;
  isReSubscribable: boolean;
  switchPlan: () => boolean;
  reSubscribe: () => boolean;
  switchLabel: LocalizationKey | null;
  cancelLabel: LocalizationKey;
  reSubscribeLabel: LocalizationKey;
};

export type SubscriptionDetailsActionsViewData = {
  actions: Array<{ key: string; label: LocalizationKey; isDestructive: boolean; onClick: () => void }>;
};

export type SubscriptionDetailsFooterModel = {
  hasNextPayment: boolean;
  hasSelection: boolean;
  selectionId: string | null;
  isCurrentScope: () => boolean;
  cancelSubscription: () => Promise<boolean>;
  keepLabel: LocalizationKey;
  cancelLabel: LocalizationKey;
  titleLabel: LocalizationKey | null;
  descriptionLabel: LocalizationKey | null;
};

export type SubscriptionDetailsFooterOptions = {
  confirmationOpen: boolean;
  setConfirmationOpen: (open: boolean) => void;
  onComplete: () => void;
  closeDrawer: () => void;
};

export type SubscriptionDetailsFooterViewData = Omit<
  SubscriptionDetailsFooterModel,
  'selectionId' | 'isCurrentScope' | 'cancelSubscription'
> & {
  confirmationOpen: boolean;
  onOpenChange: (open: boolean) => void;
  keepSubscription: () => void;
  cancelSubscription: () => Promise<void>;
  isLoading: boolean;
  error: string | undefined;
};

export type SubscriptionDetailsActionsOptions = {
  isOpen: boolean;
  closeDrawer: () => void;
  selectForCancellation: (id: string) => void;
};
