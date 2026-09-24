import { OrganizationProfileGeneralPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-general-panel.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile-general-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileGeneralPanel',
  label: 'General panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-general-panel.view.tsx',
};

export function Default() {
  const { general } = useOrganizationProfileFixture();
  return <OrganizationProfileGeneralPanelView {...general} />;
}

export function ReadOnly() {
  const { general } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileGeneralPanelView
      name={general.name}
      slug={general.slug}
      memberCount={general.memberCount}
      imageUrl={general.imageUrl}
      hasImage={general.hasImage}
    />
  );
}
