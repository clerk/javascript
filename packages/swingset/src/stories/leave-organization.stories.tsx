/** @jsxImportSource @emotion/react */
import { LeaveOrganization } from '@clerk/ui/mosaic/sections/leave-organization';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Sections',
  title: 'LeaveOrganization',
  label: 'Leave Org',
  source: 'packages/ui/src/mosaic/sections/leave-organization.tsx',
};

export function Default() {
  return <LeaveOrganization resourceName="Alex's Organization" />;
}
