import { OrganizationProfileSsoSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-sso-section.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-sso-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileSsoSection',
  label: 'SSO',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-sso-section.view.tsx',
};

export function Default() {
  return (
    <OrganizationProfileSsoSectionView
      connections={[{ id: 'sso', domain: 'clerk.dev', protocol: 'SAML' }]}
      onAdd={() => undefined}
      onManage={() => undefined}
    />
  );
}

export function Empty() {
  return (
    <OrganizationProfileSsoSectionView
      connections={[]}
      onAdd={() => undefined}
    />
  );
}
