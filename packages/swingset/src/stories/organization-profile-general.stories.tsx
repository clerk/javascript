/** @jsxImportSource @emotion/react */
import { OrganizationProfileGeneral } from '@clerk/ui/mosaic/panels/organization-profile-general';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Panels',
  title: 'OrganizationProfileGeneral',
  label: 'Org Profile General',
  source: 'packages/ui/src/mosaic/panels/organization-profile-general.tsx',
};

export function Default() {
  return <OrganizationProfileGeneral />;
}
