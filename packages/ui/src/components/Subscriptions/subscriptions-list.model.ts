import { useProtect } from '@/ui/common/Gate';
import { getBillingPeriodLabel, getDiscountDescription, toNegativeAmount } from '@/ui/utils/billing';
import { getSeatLimitAndIncludedSeatsLocalizationKey } from '@/ui/utils/billingPlanSeats';
import { isManageableSubscriptionItem } from '@/ui/utils/billingSubscription';

import {
  useEnvironment,
  usePlansContext,
  useSubscriberTypeContext,
  useSubscriberTypeLocalizationRoot,
  useSubscription,
} from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import type { SubscriptionsListData } from './subscriptions-list.types';

export const useSubscriptionsListModel = (): SubscriptionsListData => {
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const subscriberType = useSubscriberTypeContext();
  const { subscriptionItems, data: subscription, isLoading } = useSubscription();
  const canManageBilling =
    useProtect(has => has({ permission: 'org:sys_billing:manage' })) || subscriberType === 'user';
  const { commerceSettings } = useEnvironment();
  const { openSubscriptionDetails, captionForSubscription } = usePlansContext();
  const { t, $ } = useLocalizations();
  const { navigate } = useRouter();
  const billingPlansExist =
    (commerceSettings.billing.user.hasPaidPlans && subscriberType === 'user') ||
    (commerceSettings.billing.organization.hasPaidPlans && subscriberType === 'organization');
  const hasManageableSubscription = subscriptionItems.some(isManageableSubscriptionItem);
  const sortedSubscriptionItems = [...subscriptionItems].sort(
    (a, b) => Number(b.status === 'active') - Number(a.status === 'active'),
  );
  const monthLabel = t(localizationKeys('billing.month')).toLowerCase();

  return {
    localizationRoot,
    isLoading,
    billingPlansExist,
    isManageButtonVisible: canManageBilling && hasManageableSubscription,
    onManage: openSubscriptionDetails,
    onSwitchPlans: () => void navigate('plans'),
    items: sortedSubscriptionItems.map(subscriptionItem => {
      const fee =
        subscriptionItem.planPeriod === 'annual' ? subscriptionItem.plan.annualFee : subscriptionItem.plan.fee;
      const appliedDiscount = subscriptionItem.appliedDiscount;
      const seatsQuantity = subscriptionItem.seats?.quantity;
      const seatsTotalTier = subscriptionItem.seats?.tiers?.find(tier => tier.total.amount > 0);
      const discountTotalCycles =
        appliedDiscount?.cyclesRemaining === null
          ? null
          : appliedDiscount
            ? appliedDiscount.cyclesApplied + appliedDiscount.cyclesRemaining
            : null;

      const caption =
        !subscriptionItem.plan.isDefault || subscriptionItem.status === 'upcoming'
          ? captionForSubscription(subscriptionItem)
          : null;
      const seatsLabel =
        typeof seatsQuantity !== 'undefined'
          ? getSeatLimitAndIncludedSeatsLocalizationKey(subscriptionItem.plan)
          : null;

      return {
        id: subscriptionItem.id,
        name: subscriptionItem.plan.name,
        status: subscriptionItem.status,
        showBadge: subscriptionItem.isFreeTrial || sortedSubscriptionItems.length > 1 || !!subscriptionItem.canceledAt,
        badgeStatus: subscriptionItem.isFreeTrial ? ('free_trial' as const) : subscriptionItem.status,
        caption: caption
          ? {
              key: caption.key,
              params: caption.params
                ? Object.fromEntries(
                    Object.entries(caption.params).map(([key, value]) => [
                      key,
                      value instanceof Date ? new Date(value.getTime()) : value,
                    ]),
                  )
                : undefined,
            }
          : null,
        feeText: $(fee as NonNullable<typeof fee>, { style: 'short' }),
        hasFee: (fee?.amount ?? 0) > 0,
        isAnnual: subscriptionItem.planPeriod === 'annual',
        seats:
          typeof seatsQuantity !== 'undefined'
            ? {
                limitAndIncludedLabel: seatsLabel,
                paidUsage: seatsTotalTier?.quantity
                  ? t(
                      localizationKeys('organizationProfile.billingPage.subscriptionsListSection.paidSeatsUsage', {
                        seatsQuantity: seatsTotalTier.quantity,
                        amount: `${$(seatsTotalTier.feePerBlock)} / ${monthLabel}`,
                      }),
                    )
                  : null,
              }
            : null,
        discount:
          appliedDiscount?.status === 'active'
            ? {
                title: `${appliedDiscount.name} (${getDiscountDescription(
                  appliedDiscount,
                  discountTotalCycles,
                  subscriptionItem.planPeriod,
                  { $, t },
                )})`,
                cyclesRemaining: appliedDiscount.cyclesRemaining,
                periodLabel:
                  appliedDiscount.cyclesRemaining !== null
                    ? getBillingPeriodLabel(subscriptionItem.planPeriod, appliedDiscount.cyclesRemaining, t)
                    : null,
                amount: appliedDiscount.amount ? $(toNegativeAmount(appliedDiscount.amount)) : null,
              }
            : null,
      };
    }),
    overview:
      sortedSubscriptionItems.length > 0 && subscription?.nextPayment?.totals
        ? {
            amount: $(subscription.nextPayment.totals.grandTotal),
            date: new Date(subscription.nextPayment.date.getTime()),
          }
        : null,
  };
};
