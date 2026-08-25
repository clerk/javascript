import { OrganizationProfileVerifiedDomainsSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-verified-domains-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-verified-domains-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileVerifiedDomainsSection',
  label: 'Verified domains',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-verified-domains-section.view.tsx',
};

export function Default() {
  return (
    <OrganizationProfileVerifiedDomainsSectionView
      domains={[{ id: 'domain', name: 'clerk.dev', enrollmentModeLabel: 'Automatic invitations' }]}
      onAdd={() => undefined}
      onManage={() => undefined}
    />
  );
}

export function Empty() {
  return (
    <OrganizationProfileVerifiedDomainsSectionView
      domains={[]}
      onAdd={() => undefined}
    />
  );
}
