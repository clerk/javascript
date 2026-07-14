/** @jsxImportSource @emotion/react */
import { OrganizationBillingPaymentDetailView } from '@clerk/ui/mosaic/organization/organization-billing-payment-detail.view';
import type { PaymentDetailLineItem } from '@clerk/ui/mosaic/organization/organization-billing-payment-detail.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationBillingPaymentDetail',
  source: 'packages/ui/src/mosaic/organization/organization-billing-payment-detail.tsx',
};

const DEMO_LINE_ITEMS: PaymentDetailLineItem[] = [
  { id: 'plan', title: 'Pro', value: '$30.00' },
  { id: 'seats', title: 'Seats', description: '3 seats at $10.00/mo (5 total - 2 included)', value: '$30.00' },
  { id: 'subtotal', title: 'Subtotal', value: '$60.00' },
  { id: 'discount', title: 'Prorated discount', value: '-$2.00' },
  { id: 'account-credit', title: 'Account credit', value: '-$1.00' },
];

export function Default() {
  return (
    <OrganizationBillingPaymentDetailView
      title='March 15, 2026'
      idLabel='pay…f8a2'
      statusLabel='Paid'
      statusIntent='success'
      backLabel='Payments'
      onBack={() => undefined}
      lineItems={DEMO_LINE_ITEMS}
      totalLabel='Total due'
      totalValue='$57.00'
      currency='USD'
    />
  );
}
