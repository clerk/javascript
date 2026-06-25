/** @jsxImportSource @emotion/react */
import { DeleteOrganization } from '@clerk/ui/mosaic/sections/delete-organization';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Sections',
  title: 'DeleteOrganization',
  label: 'Delete Org',
  source: 'packages/ui/src/mosaic/sections/delete-organization.tsx',
};

export function Default() {
  return <DeleteOrganization />;
}
