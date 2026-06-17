/** @jsxImportSource @emotion/react */
import { OrganizationProfileMembers } from '@clerk/ui/mosaic/panels/organization-profile-members';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Panels',
  title: 'OrganizationProfileMembers',
  label: 'Org Profile Members',
  source: 'packages/ui/src/mosaic/panels/organization-profile-members.tsx',
};

export function Default() {
  return <OrganizationProfileMembers />;
}
