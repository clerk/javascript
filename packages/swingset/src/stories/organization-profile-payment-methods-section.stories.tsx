import { OrganizationProfilePaymentMethodsSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-payment-methods-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-payment-methods-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfilePaymentMethodsSection',
  label: 'Payment methods',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-payment-methods-section.view.tsx',
};

export const paymentMethods = [
  { id: 'visa', label: 'Visa •••• 0644', expiryLabel: 'Expires 02/2029', isDefault: true },
  { id: 'mastercard', label: 'Mastercard •••• 1212', expiryLabel: 'Expires 02/2029' },
];

export function Default() {
  return (
    <OrganizationProfilePaymentMethodsSectionView
      paymentMethods={paymentMethods}
      onAdd={() => undefined}
      onManage={() => undefined}
    />
  );
}

export function Empty() {
  return (
    <OrganizationProfilePaymentMethodsSectionView
      paymentMethods={[]}
      onAdd={() => undefined}
    />
  );
}
