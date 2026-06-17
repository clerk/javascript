/** @jsxImportSource @emotion/react */
import { OrganizationProfileApiKeys } from '@clerk/ui/mosaic/panels/organization-profile-api-keys';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Panels',
  title: 'OrganizationProfileApiKeys',
  label: 'Org Profile API Keys',
  source: 'packages/ui/src/mosaic/panels/organization-profile-api-keys.tsx',
};

export function Default() {
  return <OrganizationProfileApiKeys />;
}
