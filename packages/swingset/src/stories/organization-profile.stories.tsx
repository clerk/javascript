/** @jsxImportSource @emotion/react */
import { OrganizationProfileView } from '@clerk/ui/mosaic/aio/organization-profile-view';

import type { StoryMeta } from '@/lib/types';

import { Default as OrganizationProfileGeneralPanelDemo } from './organization-profile-general-panel.stories';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfile',
  source: 'packages/ui/src/mosaic/aio/organization-profile.tsx',
};

export function Default() {
  return <OrganizationProfileView general={<OrganizationProfileGeneralPanelDemo />} />;
}
