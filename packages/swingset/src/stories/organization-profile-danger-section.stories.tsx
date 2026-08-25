import { OrganizationProfileDangerSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-danger-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-danger-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileDangerSection',
  label: 'Danger zone',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-danger-section.view.tsx',
};

export function Default() {
  return (
    <OrganizationProfileDangerSectionView
      onDeleteOrganization={() => undefined}
      onLeaveOrganization={() => undefined}
    />
  );
}
