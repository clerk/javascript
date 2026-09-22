import { OrganizationProfileBillingPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-billing-panel.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-billing-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs design',
  title: 'OrganizationProfileBillingPanel',
  label: 'Billing panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-billing-panel.view.tsx',
};

export function Default() {
  return <OrganizationProfileBillingPanelView />;
}
