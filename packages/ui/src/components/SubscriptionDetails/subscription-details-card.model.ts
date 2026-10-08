import { getSeatLimitAndIncludedSeatsLocalizationKey } from '@/ui/utils/billingPlanSeats';
import { formatDate } from '@/ui/utils/formatDate';

import { useSubscription } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import type { SubscriptionDetailsCardData } from './subscription-details.types';

export const useSubscriptionDetailsCardModel = (subscriptionId: string): SubscriptionDetailsCardData | null => {
  const { subscriptionItems } = useSubscription();
  const { t, $ } = useLocalizations();
  const subscription = subscriptionItems?.find(item => item.id === subscriptionId);
  if (!subscription) {
    return null;
  }
  const firstPaidSeatTier = subscription.seats?.tiers?.find(tier => tier.total.amount > 0);
  const monthLabel = t(localizationKeys('billing.month')).toLowerCase();
  const fee = (
    subscription.planPeriod === 'month' ? subscription.plan.fee : subscription.plan.annualFee
  ) as NonNullable<typeof subscription.plan.fee>;
  const isActive = subscription.status === 'active';
  const isUpcoming = subscription.status === 'upcoming';

  return {
    planName: subscription.plan.name,
    avatarUrl: subscription.plan.avatarUrl,
    feeFormatted: $(fee),
    periodText: ` / ${t(localizationKeys(`billing.${subscription.planPeriod === 'month' ? 'month' : 'year'}`))}`,
    badgeStatus: subscription.isFreeTrial ? ('free_trial' as const) : subscription.status,
    hasSeats: typeof subscription.seats?.quantity !== 'undefined',
    seatLimitText: getSeatLimitAndIncludedSeatsLocalizationKey(subscription.plan),
    paidSeatsUsageText: firstPaidSeatTier?.quantity
      ? t(
          localizationKeys('organizationProfile.billingPage.subscriptionsListSection.paidSeatsUsage', {
            seatsQuantity: firstPaidSeatTier.quantity,
            amount: `${$(firstPaidSeatTier.feePerBlock)} / ${monthLabel}`,
          }),
        )
      : null,
    pastDueDate: subscription.pastDueAt ? formatDate(subscription.pastDueAt) : null,
    isActive,
    startedLabel: subscription.isFreeTrial
      ? localizationKeys('billing.subscriptionDetails.trialStartedOn')
      : localizationKeys('billing.subscriptionDetails.subscribedOn'),
    startedDate: formatDate(subscription.createdAt),
    endLabel: subscription.canceledAt
      ? localizationKeys('billing.subscriptionDetails.endsOn')
      : subscription.isFreeTrial
        ? localizationKeys('billing.subscriptionDetails.trialEndsOn')
        : localizationKeys('billing.subscriptionDetails.renewsAt'),
    endDate: subscription.periodEnd ? formatDate(subscription.periodEnd) : null,
    isUpcoming,
    beginningDate: formatDate(subscription.periodStart),
  };
};
