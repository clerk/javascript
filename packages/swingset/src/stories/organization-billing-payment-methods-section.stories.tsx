/** @jsxImportSource @emotion/react */
import type { PaymentMethodRow } from '@clerk/ui/mosaic/organization/organization-billing-payment-methods-section.view';
import { OrganizationBillingPaymentMethodsSectionView } from '@clerk/ui/mosaic/organization/organization-billing-payment-methods-section.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationBillingPaymentMethodsSection',
  source: 'packages/ui/src/mosaic/organization/organization-billing-payment-methods-section.tsx',
};

const DEMO_ROWS: PaymentMethodRow[] = [
  {
    id: 'pm_1',
    typeLabel: 'Visa',
    detailLabel: '⋯ 4242',
    label: 'visa ⋯ 4242',
    isDefault: true,
    isExpired: false,
    isRemovable: true,
  },
  {
    id: 'pm_2',
    typeLabel: 'Mastercard',
    detailLabel: '⋯ 1111',
    label: 'mastercard ⋯ 1111',
    isDefault: false,
    isExpired: true,
    isRemovable: true,
  },
];

export function Default() {
  return (
    <OrganizationBillingPaymentMethodsSectionView
      title='Payment methods'
      rows={DEMO_ROWS}
      makeDefaultPendingId={null}
      makeDefaultError={null}
      onMakeDefault={() => undefined}
      onRemove={() => undefined}
      remove={{
        open: false,
        label: '',
        error: null,
        submitting: false,
        onConfirm: () => undefined,
        onCancel: () => undefined,
      }}
    />
  );
}
