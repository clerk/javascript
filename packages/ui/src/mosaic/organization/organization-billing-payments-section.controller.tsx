import type { BillingPaymentResource } from '@clerk/shared/types';

import { usePaymentAttempts } from '@/contexts';
import { useRouter } from '@/router';
import { truncateWithEndVisible } from '@/utils/truncateTextWithEndVisible';

import { formatLongDate, formatMoney } from './billing-format';
import type { PaymentAttemptRow, PaymentAttemptStatusIntent } from './organization-billing-payments-section.view';

type OrganizationBillingPaymentsSectionController =
  | { status: 'loading' }
  | {
      status: 'ready';
      /** Table header labels (date / amount / status). */
      columnHeaders: { date: string; amount: string; status: string };
      rows: PaymentAttemptRow[];
      /** Copy shown when there are no payments. */
      emptyLabel: string;
      /** Navigates to a payment attempt's detail screen. */
      onSelectRow: (id: string) => void;
    };

const STATUS_INTENT: Record<BillingPaymentResource['status'], PaymentAttemptStatusIntent> = {
  paid: 'success',
  failed: 'danger',
  pending: 'primary',
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function useOrganizationBillingPaymentsSectionController(): OrganizationBillingPaymentsSectionController {
  const { data: payments, isLoading } = usePaymentAttempts();
  const { navigate } = useRouter();

  // First load with nothing to show yet — mirror the sibling sections' skeleton gate.
  if (isLoading && payments.length === 0) {
    return { status: 'loading' };
  }

  return {
    status: 'ready',
    columnHeaders: { date: 'Date', amount: 'Amount', status: 'Status' },
    rows: payments.map(payment => ({
      id: payment.id,
      dateLabel: formatLongDate(payment.paidAt || payment.failedAt || payment.updatedAt),
      idLabel: truncateWithEndVisible(payment.id),
      amountLabel: formatMoney(payment.amount),
      statusLabel: capitalize(payment.status),
      statusIntent: STATUS_INTENT[payment.status] ?? 'primary',
    })),
    emptyLabel: 'No payment history',
    onSelectRow: id => void navigate(`payment-attempt/${id}`),
  };
}
