import { OrganizationProfileGeneralPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-general-panel.view';
import { OrganizationProfileProfileSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-profile-section/organization-profile-profile-section.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile-general-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  title: 'OrganizationProfileGeneralPanel',
  label: 'General panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-general-panel.tsx',
};

export function Default() {
  const { general } = useOrganizationProfileFixture();
  return <OrganizationProfileGeneralPanelView {...general} />;
}

export function ReadOnly() {
  const { profile } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileGeneralPanelView>
      <OrganizationProfileProfileSectionView
        name={profile.name}
        slug={profile.slug}
        imageUrl={profile.imageUrl}
        hasImage={profile.hasImage}
      />
    </OrganizationProfileGeneralPanelView>
  );
}
