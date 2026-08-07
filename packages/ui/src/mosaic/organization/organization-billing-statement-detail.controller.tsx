import type { BillingMoneyAmount, BillingPaymentResource } from '@clerk/shared/types';

import { useStatement } from '@/contexts';
import { useRouter } from '@/router';
import { truncateWithEndVisible } from '@/utils/truncateTextWithEndVisible';

import { formatLongDate, formatMoney, formatMonthYear } from './billing-format';
import type { StatementDetailAdjustment, StatementDetailSection } from './organization-billing-statement-detail.view';

type OrganizationBillingStatementDetailController =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      /** Statement month/year, e.g. `"March 2026"`. */
      title: string;
      idLabel: string;
      /** Statement status, e.g. `"Open"`. */
      statusLabel: string;
      backLabel: string;
      onBack: () => void;
      sections: StatementDetailSection[];
      totalLabel: string;
      totalValue: string;
      currency: string;
    };

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function positiveAmount(amount: BillingMoneyAmount | undefined | null): amount is BillingMoneyAmount {
  return Boolean(amount) && (amount?.amount ?? 0) > 0;
}

function buildAdjustments(item: BillingPaymentResource): StatementDetailAdjustment[] {
  const adjustments: StatementDetailAdjustment[] = [];
  const { subscriptionItem } = item;

  const discount = item.totals?.discounts?.proration?.amount;
  if (positiveAmount(discount)) {
    adjustments.push({ id: `${item.id}-discount`, label: 'Prorated discount', value: `(${formatMoney(discount)})` });
  }

  const prorationCredit = subscriptionItem.credits?.proration?.amount;
  if (positiveAmount(prorationCredit)) {
    adjustments.push({
      id: `${item.id}-proration-credit`,
      label: 'Prorated credit for partial usage of previous subscription',
      value: `(${formatMoney(prorationCredit)})`,
    });
  }

  const payerCredit = subscriptionItem.credits?.payer?.appliedAmount;
  if (positiveAmount(payerCredit)) {
    adjustments.push({
      id: `${item.id}-payer-credit`,
      label: 'Credit from account balance',
      value: `(${formatMoney(payerCredit)})`,
    });
  }

  return adjustments;
}

export function useOrganizationBillingStatementDetailController(): OrganizationBillingStatementDetailController {
  const { params, navigate } = useRouter();
  const { data: statement, isLoading, error } = useStatement(params.statementId);

  if (isLoading) {
    return { status: 'loading' };
  }

  if (!statement) {
    const apiError = error?.errors[0];
    return { status: 'error', message: apiError?.longMessage ?? apiError?.message ?? 'Statement not found' };
  }

  const sections: StatementDetailSection[] = statement.groups.map(group => ({
    id: group.timestamp.toISOString(),
    dateLabel: formatLongDate(group.timestamp),
    items: group.items.map(item => {
      const { subscriptionItem } = item;
      const period = subscriptionItem.planPeriod;
      return {
        id: item.id,
        planName: subscriptionItem.plan.name,
        planDescription: `${subscriptionItem.amount ? formatMoney(subscriptionItem.amount) : ''} / ${period === 'month' ? 'Month' : 'Year'}`,
        amountLabel: formatMoney(item.amount),
        caption:
          item.chargeType === 'recurring'
            ? `Paid for ${subscriptionItem.plan.name} ${period} plan`
            : `Subscribed and paid for ${subscriptionItem.plan.name} ${period} plan`,
        viewPaymentLabel: 'View payment',
        onViewPayment: () => void navigate(`../../payment-attempt/${item.id}`),
        adjustments: buildAdjustments(item),
      };
    }),
  }));

  return {
    status: 'ready',
    title: formatMonthYear(statement.timestamp),
    idLabel: truncateWithEndVisible(statement.id),
    statusLabel: capitalize(statement.status),
    backLabel: 'Statements',
    onBack: () => void navigate('../../', { searchParams: new URLSearchParams('tab=statements') }),
    sections,
    totalLabel: 'Total paid',
    totalValue: formatMoney(statement.totals.grandTotal),
    currency: 'USD',
  };
}
