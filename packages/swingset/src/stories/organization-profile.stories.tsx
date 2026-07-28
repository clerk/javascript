/** @jsxImportSource @emotion/react */
import { OrganizationProfileView } from '@clerk/ui/mosaic/organization/organization-profile-view';

import type { StoryMeta } from '@/lib/types';

import { Default as OrganizationProfileApiKeysPanelDemo } from './organization-profile-api-keys-panel.stories';
import { Default as OrganizationProfileGeneralPanelDemo } from './organization-profile-general-panel.stories';
import { Default as OrganizationProfileMembersPanelDemo } from './organization-profile-members-panel.stories';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfile',
  source: 'packages/ui/src/mosaic/organization/organization-profile.tsx',
};

export function Default() {
  return (
    <OrganizationProfileView
      general={<OrganizationProfileGeneralPanelDemo />}
      members={<OrganizationProfileMembersPanelDemo />}
      apiKeys={<OrganizationProfileApiKeysPanelDemo />}
    />
  );
}
