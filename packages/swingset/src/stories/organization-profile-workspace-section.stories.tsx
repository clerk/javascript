import { OrganizationProfileWorkspaceSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-workspace-section/organization-profile-workspace-section.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile-workspace-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileWorkspaceSection',
  label: 'Workspace details',
  navigation: { category: 'Sections' },
  source:
    'packages/mosaic/src/features/organization-profile/organization-profile-workspace-section/organization-profile-workspace-section.view.tsx',
};

export function Default() {
  const { general } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileWorkspaceSectionView
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
    <OrganizationProfileWorkspaceSectionView
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
