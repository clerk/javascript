/** @jsxImportSource @emotion/react */
import { LeaveOrganization } from '@clerk/ui/mosaic/section/leave-organization';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Sections',
  title: 'LeaveOrganization',
  source: 'packages/ui/src/mosaic/section/leave-organization.tsx',
};

export function Default() {
  return <LeaveOrganization organizationName="Alex's Organization" />;
}
