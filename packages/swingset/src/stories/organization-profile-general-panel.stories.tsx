/** @jsxImportSource @emotion/react */
import { OrganizationProfileGeneralPanelView } from '@clerk/ui/mosaic/organization/organization-profile-general-panel-view';

import type { StoryMeta } from '@/lib/types';

import { Default as OrganizationProfileDeleteSectionDemo } from './organization-profile-delete-section.stories';
import { Default as OrganizationProfileLeaveSectionDemo } from './organization-profile-leave-section.stories';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfileGeneralPanel',
  source: 'packages/ui/src/mosaic/organization/organization-profile-general-panel.tsx',
};

export function Default() {
  return (
    <OrganizationProfileGeneralPanelView
      leaveOrganization={<OrganizationProfileLeaveSectionDemo />}
      deleteOrganization={<OrganizationProfileDeleteSectionDemo />}
    />
  );
}
