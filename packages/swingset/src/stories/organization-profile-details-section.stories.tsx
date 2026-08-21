import { OrganizationProfileDetailsSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-details-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-details-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileDetailsSection',
  label: 'Organization details',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-details-section.view.tsx',
};

export function Default() {
  return (
    <OrganizationProfileDetailsSectionView
      name='Clerk'
      slug='clerkorganization-177654156132154'
      onCopySlug={() => undefined}
      onNameChange={() => undefined}
      onUploadLogo={() => undefined}
    />
  );
}
