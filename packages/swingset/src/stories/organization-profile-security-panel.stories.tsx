import { OrganizationProfileSecurityPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-security-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs design',
  title: 'OrganizationProfileSecurityPanel',
  label: 'Security panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-security-panel.view.tsx',
};

export function Default() {
  return <OrganizationProfileSecurityPanelView />;
}
