import { OrganizationProfileSecurityPanelView } from '@clerk/ui/mosaic/organization-profile/organization-profile-security-panel.view';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-security-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileSecurityPanel',
  label: 'Security panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-security-panel.view.tsx',
};

export function Default() {
  return (
    <OrganizationProfileSecurityPanelView
      sso={{
        connections: [{ id: 'sso', domain: 'clerk.dev', protocol: 'SAML' }],
        onAdd: () => undefined,
        onManage: () => undefined,
      }}
      verifiedDomains={{
        domains: [{ id: 'domain', name: 'clerk.dev', enrollmentModeLabel: 'Automatic invitations' }],
        onAdd: () => undefined,
        onManage: () => undefined,
      }}
    />
  );
}
