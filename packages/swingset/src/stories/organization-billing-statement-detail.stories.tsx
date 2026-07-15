/** @jsxImportSource @emotion/react */
import type { StatementDetailSection } from '@clerk/ui/mosaic/organization/organization-billing-statement-detail.view';
import { OrganizationBillingStatementDetailView } from '@clerk/ui/mosaic/organization/organization-billing-statement-detail.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationBillingStatementDetail',
  source: 'packages/ui/src/mosaic/organization/organization-billing-statement-detail.tsx',
};

const DEMO_SECTIONS: StatementDetailSection[] = [
  {
    id: 'group-1',
    dateLabel: 'March 15, 2026',
    items: [
      {
        id: 'pay_1',
        planName: 'Pro',
        planDescription: '$30.00 / Month',
        amountLabel: '$30.00',
        caption: 'Paid for Pro month plan',
        viewPaymentLabel: 'View payment',
        onViewPayment: () => undefined,
        adjustments: [
          { id: 'a1', label: 'Prorated discount', value: '($2.00)' },
          {
            id: 'a2',
            label: 'Prorated credit for partial usage of previous subscription',
            value: '($5.00)',
          },
        ],
      },
    ],
  },
];

export function Default() {
  return (
    <OrganizationBillingStatementDetailView
      title='March 2026'
      idLabel='stmt…f8a2'
      statusLabel='Open'
      backLabel='Statements'
      onBack={() => undefined}
      sections={DEMO_SECTIONS}
      totalLabel='Total paid'
      totalValue='$50.00'
      currency='USD'
    />
  );
}
