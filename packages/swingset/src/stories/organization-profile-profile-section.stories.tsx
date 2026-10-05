import { OrganizationProfileProfileSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-profile-section/organization-profile-profile-section.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile-profile-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileProfileSection',
  label: 'Organization details',
  navigation: { category: 'Sections' },
  source:
    'packages/mosaic/src/features/organization-profile/organization-profile-profile-section/organization-profile-profile-section.view.tsx',
};

export function Default() {
  const { general } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileProfileSectionView
      name={general.name}
      slug={general.slug}
      imageUrl={general.imageUrl}
      hasImage={general.hasImage}
      onLogoChange={general.onLogoChange}
      onRemoveLogo={general.onRemoveLogo}
      onSubmitName={general.onSubmitName}
      onSubmitSlug={general.onSubmitSlug}
    />
  );
}

export function SaveFails() {
  const { general } = useOrganizationProfileFixture({ failWith: { slug: 'That slug is already taken.' } });
  return (
    <OrganizationProfileProfileSectionView
      name={general.name}
      slug={general.slug}
      imageUrl={general.imageUrl}
      hasImage={general.hasImage}
      onLogoChange={general.onLogoChange}
      onRemoveLogo={general.onRemoveLogo}
      onSubmitName={general.onSubmitName}
      onSubmitSlug={general.onSubmitSlug}
    />
  );
}
