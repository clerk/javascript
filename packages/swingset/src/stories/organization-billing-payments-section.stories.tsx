/** @jsxImportSource @emotion/react */
import type { PaymentAttemptRow } from '@clerk/ui/mosaic/organization/organization-billing-payments-section.view';
import { OrganizationBillingPaymentsSectionView } from '@clerk/ui/mosaic/organization/organization-billing-payments-section.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationBillingPaymentsSection',
  source: 'packages/ui/src/mosaic/organization/organization-billing-payments-section.tsx',
};

const DEMO_ROWS: PaymentAttemptRow[] = [
  {
    id: 'pay_1',
    dateLabel: 'March 15, 2026',
    idLabel: 'pay…f8a2',
    amountLabel: '$50.00',
    statusLabel: 'Paid',
    statusIntent: 'success',
  },
  {
    id: 'pay_2',
    dateLabel: 'February 15, 2026',
    idLabel: 'pay…c41d',
    amountLabel: '$50.00',
    statusLabel: 'Failed',
    statusIntent: 'danger',
  },
];

export function Default() {
  return (
    <OrganizationBillingPaymentsSectionView
      columnHeaders={{ date: 'Date', amount: 'Amount', status: 'Status' }}
      rows={DEMO_ROWS}
      emptyLabel='No payment history'
      onSelectRow={() => undefined}
    />
  );
}
