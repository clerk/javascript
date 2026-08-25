import { OrganizationProfileSubscriptionSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-subscription-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-subscription-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileSubscriptionSection',
  label: 'Subscription',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-subscription-section.view.tsx',
};

export const subscription = {
  planName: 'Pro',
  statusLabel: 'Active',
  priceLabel: '$200 per month, billed monthly',
  seatsUsed: 6,
  seatsTotal: 10,
  seatLineItems: [
    { id: 'included', label: '5 seats included with Pro', amountLabel: '$0.00' },
    { id: 'additional', label: '1 additional seat', amountLabel: '$19.00' },
  ],
};

export function Default() {
  return (
    <OrganizationProfileSubscriptionSectionView
      subscription={subscription}
      onChangePlan={() => undefined}
      onManagePlan={() => undefined}
      onManageSeats={() => undefined}
    />
  );
}
