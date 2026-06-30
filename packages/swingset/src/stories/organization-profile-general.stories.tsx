/** @jsxImportSource @emotion/react */
import { OrganizationProfileGeneralView } from '@clerk/ui/mosaic/panels/organization-profile-general-view';

import type { StoryMeta } from '@/lib/types';

import { Default as DeleteOrganizationDemo } from './delete-organization.stories';
import { Default as LeaveOrganizationDemo } from './leave-organization.stories';

export const meta: StoryMeta = {
  group: 'Panels',
  title: 'OrganizationProfileGeneral',
  label: 'Org Profile General',
  source: 'packages/ui/src/mosaic/panels/organization-profile-general.tsx',
};

export function Default() {
  return (
    <OrganizationProfileGeneralView
      leaveOrganization={<LeaveOrganizationDemo />}
      deleteOrganization={<DeleteOrganizationDemo />}
    />
  );
}
