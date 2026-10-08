import { __internal_usePaymentAttemptQuery } from '@clerk/shared/react/index';

import { getDiscountDescription, toNegativeAmount } from '@/ui/utils/billing';
import { getPlanSeatLimit, getSeatsPerUnitTotal, summarizeSeatCharges } from '@/ui/utils/billingPlanSeats';
import { formatDate } from '@/ui/utils/formatDate';

import { useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts/components';
import { localizationKeys, useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import type { PaymentAttemptPageData } from './payment-attempt.types';

export const usePaymentAttemptModel = (): PaymentAttemptPageData => {
  const { params, navigate } = useRouter();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { t, translateError, $ } = useLocalizations();
  const {
    data: paymentAttempt,
    isLoading,
    error,
  } = __internal_usePaymentAttemptQuery({
    paymentAttemptId: params.paymentAttemptId,
    for: subscriberType === 'organization' ? 'organization' : 'user',
    enabled: Boolean(params.paymentAttemptId),
  });

  const readyAttempt = isLoading ? undefined : paymentAttempt;
  const subscriptionItem = readyAttempt?.subscriptionItem;
  const catalogDiscount = readyAttempt?.totals?.discounts?.discount;
  const fee = subscriptionItem
    ? subscriptionItem.planPeriod === 'month'
      ? subscriptionItem.plan.fee
      : subscriptionItem.plan.annualMonthlyFee
    : undefined;
  const seatsTotal = subscriptionItem?.seats != null ? getSeatsPerUnitTotal(readyAttempt?.totals) : undefined;
  const seatSummary = summarizeSeatCharges(seatsTotal);
  const seatsChargeable = seatSummary ? seatSummary.totalSeats - seatSummary.included : 0;
  const planSeatLimit = subscriptionItem ? (getPlanSeatLimit(subscriptionItem.plan) ?? null) : null;
  const proration = readyAttempt?.totals?.discounts?.proration;
  const creditProration = subscriptionItem?.credits?.proration;
  const payerCredit = subscriptionItem?.credits?.payer;

  return {
    isLoading,
    localizationRoot,
    errorText:
      isLoading || readyAttempt
        ? ''
        : error
          ? translateError(error.errors[0])
          : t(localizationKeys(`${localizationRoot}.billingPage.paymentHistorySection.notFound`)),
    attempt: readyAttempt
      ? {
          id: readyAttempt.id,
          title: formatDate(readyAttempt.paidAt || readyAttempt.failedAt || readyAttempt.updatedAt, 'long'),
          status: readyAttempt.status,
          currency: readyAttempt.amount.currency,
          total: $(readyAttempt.amount),
          planName: subscriptionItem?.plan.name ?? '',
          isAnnual: subscriptionItem?.planPeriod === 'annual',
          fee: $(fee as NonNullable<typeof fee>),
          seats: seatSummary
            ? {
                planSeatLimit,
                totalSeats: seatSummary.totalSeats,
                included: seatSummary.included,
                chargeable: seatsChargeable,
                rate: $(seatSummary.paidTier.feePerBlock),
                total: $(seatSummary.paidTier.total),
              }
            : null,
          subtotal: readyAttempt.totals?.subtotal ? $(readyAttempt.totals.subtotal) : '',
          proration: proration && proration.amount.amount > 0 ? $(toNegativeAmount(proration.amount)) : null,
          catalogDiscount:
            catalogDiscount && catalogDiscount.amount.amount > 0 && subscriptionItem
              ? {
                  name: catalogDiscount.name,
                  description: getDiscountDescription(
                    catalogDiscount,
                    catalogDiscount.durationInCycles,
                    subscriptionItem.planPeriod,
                    { $, t },
                  ),
                  promoCode: catalogDiscount.promoCode,
                  amount: $(toNegativeAmount(catalogDiscount.amount)),
                }
              : null,
          creditProration:
            creditProration && creditProration.amount.amount > 0 ? $(toNegativeAmount(creditProration.amount)) : null,
          payerCredit:
            payerCredit && payerCredit.appliedAmount.amount > 0 ? $(toNegativeAmount(payerCredit.appliedAmount)) : null,
        }
      : null,
    onBack: () => void navigate('../../', { searchParams: new URLSearchParams('tab=payments') }),
  };
};
