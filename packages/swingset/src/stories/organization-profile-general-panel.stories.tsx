import { OrganizationProfileGeneralPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-general-panel.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationGeneralFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile-general-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileGeneralPanel',
  label: 'General panel',
  layout: 'wide',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-general-panel.view.tsx',
};

export function Default() {
  const props = useOrganizationGeneralFixture();
  return <OrganizationProfileGeneralPanelView {...props} />;
}
