import type { BillingMoneyAmount, BillingPaymentResource } from '@clerk/shared/types';

import { usePaymentAttempt } from '@/contexts';
import { useRouter } from '@/router';
import { toNegativeAmount } from '@/utils/billing';
import { getPlanSeatLimit, getSeatsPerUnitTotal, summarizeSeatCharges } from '@/utils/billingPlanSeats';
import { truncateWithEndVisible } from '@/utils/truncateTextWithEndVisible';

import { formatLongDate, formatMoney } from './billing-format';
import type { PaymentDetailLineItem, PaymentDetailStatusIntent } from './organization-billing-payment-detail.view';

type OrganizationBillingPaymentDetailController =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      title: string;
      idLabel: string;
      statusLabel: string;
      statusIntent: PaymentDetailStatusIntent;
      backLabel: string;
      onBack: () => void;
      lineItems: PaymentDetailLineItem[];
      totalLabel: string;
      totalValue: string;
      currency: string;
    };

const STATUS_INTENT: Record<BillingPaymentResource['status'], PaymentDetailStatusIntent> = {
  paid: 'success',
  failed: 'danger',
  pending: 'primary',
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function positiveAmount(amount: BillingMoneyAmount | undefined | null): amount is BillingMoneyAmount {
  return Boolean(amount) && (amount?.amount ?? 0) > 0;
}

function buildLineItems(paymentAttempt: BillingPaymentResource): PaymentDetailLineItem[] {
  const { subscriptionItem, totals } = paymentAttempt;
  const isAnnual = subscriptionItem.planPeriod === 'annual';
  const prefix = isAnnual ? 'x12 ' : '';
  const lineItems: PaymentDetailLineItem[] = [];

  const fee = isAnnual ? subscriptionItem.plan.annualMonthlyFee : subscriptionItem.plan.fee;
  if (fee) {
    lineItems.push({ id: 'plan', title: subscriptionItem.plan.name, value: `${prefix}${formatMoney(fee)}` });
  }

  const seatsTotal = subscriptionItem.seats != null ? getSeatsPerUnitTotal(totals) : undefined;
  const seatSummary = summarizeSeatCharges(seatsTotal);
  if (seatSummary) {
    const seatsChargeable = seatSummary.totalSeats - seatSummary.included;
    const planSeatLimit = getPlanSeatLimit(subscriptionItem.plan);
    const rate = formatMoney(seatSummary.paidTier.feePerBlock);
    const isSingular = seatsChargeable === 1;
    const seatCount = isSingular ? '1 seat' : `${seatsChargeable} seats`;
    const description =
      seatSummary.included > 0
        ? `${seatCount} at ${rate}/mo (${seatSummary.totalSeats} total - ${seatSummary.included} included)`
        : `${seatCount} at ${rate}/mo`;
    lineItems.push({
      id: 'seats',
      title: planSeatLimit != null ? `Seats (up to ${planSeatLimit})` : 'Seats',
      description,
      value: `${prefix}${formatMoney(seatSummary.paidTier.total)}`,
    });
  }

  lineItems.push({ id: 'subtotal', title: 'Subtotal', value: totals?.subtotal ? formatMoney(totals.subtotal) : '' });

  const discount = totals?.discounts?.proration?.amount;
  if (positiveAmount(discount)) {
    lineItems.push({ id: 'discount', title: 'Prorated discount', value: formatMoney(toNegativeAmount(discount)) });
  }

  const prorationCredit = subscriptionItem.credits?.proration?.amount;
  if (positiveAmount(prorationCredit)) {
    lineItems.push({
      id: 'proration-credit',
      title: 'Prorated credit',
      value: formatMoney(toNegativeAmount(prorationCredit)),
    });
  }

  const payerCredit = subscriptionItem.credits?.payer?.appliedAmount;
  if (positiveAmount(payerCredit)) {
    lineItems.push({
      id: 'account-credit',
      title: 'Account credit',
      value: formatMoney(toNegativeAmount(payerCredit)),
    });
  }

  return lineItems;
}

export function useOrganizationBillingPaymentDetailController(): OrganizationBillingPaymentDetailController {
  const { params, navigate } = useRouter();
  const { data: paymentAttempt, isLoading, error } = usePaymentAttempt(params.paymentAttemptId);

  if (isLoading) {
    return { status: 'loading' };
  }

  if (!paymentAttempt) {
    const apiError = error?.errors[0];
    return { status: 'error', message: apiError?.longMessage ?? apiError?.message ?? 'Payment attempt not found' };
  }

  return {
    status: 'ready',
    title: formatLongDate(paymentAttempt.paidAt || paymentAttempt.failedAt || paymentAttempt.updatedAt),
    idLabel: truncateWithEndVisible(paymentAttempt.id),
    statusLabel: capitalize(paymentAttempt.status),
    statusIntent: STATUS_INTENT[paymentAttempt.status] ?? 'primary',
    backLabel: 'Payments',
    onBack: () => void navigate('../../', { searchParams: new URLSearchParams('tab=payments') }),
    lineItems: buildLineItems(paymentAttempt),
    totalLabel: 'Total due',
    totalValue: formatMoney(paymentAttempt.amount),
    currency: paymentAttempt.amount.currency.toUpperCase(),
  };
}
