/** @jsxImportSource @emotion/react */
import { OrganizationProfileView } from '@clerk/ui/mosaic/aio/organization-profile-view';

import type { StoryMeta } from '@/lib/types';

import { Default as OrganizationProfileGeneralDemo } from './organization-profile-general.stories';

export const meta: StoryMeta = {
  group: 'AIO',
  title: 'OrganizationProfile',
  label: 'Org Profile',
  source: 'packages/ui/src/mosaic/aio/organization-profile.tsx',
};

export function Default() {
  return <OrganizationProfileView general={<OrganizationProfileGeneralDemo />} />;
}
