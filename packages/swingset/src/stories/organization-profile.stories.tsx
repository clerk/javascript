/** @jsxImportSource @emotion/react */
import { OrganizationProfile } from '@clerk/ui/mosaic/aio/organization-profile';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'AIO',
  title: 'OrganizationProfile',
  label: 'Org Profile',
  source: 'packages/ui/src/mosaic/aio/organization-profile.tsx',
  wide: true,
};

export function Default() {
  return <OrganizationProfile />;
}
