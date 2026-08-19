import type { OrganizationPagePanels } from '@clerk/ui/mosaic/organization-profile/organization-page.view';
import { OrganizationPageView } from '@clerk/ui/mosaic/organization-profile/organization-page.view';
import { OrganizationProfileGeneralPanelView } from '@clerk/ui/mosaic/organization-profile/organization-profile-general-panel.view';
import { OrganizationProfileMembersPanelView } from '@clerk/ui/mosaic/organization-profile/organization-profile-members-panel.view';
import type { OrganizationProfilePanelId } from '@clerk/ui/mosaic/organization-profile/organization-profile-sidebar';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { members } from './organization-profile-members-section.stories';

export { default as __source } from './organization-page.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationPage',
  label: 'Organization page',
  layout: 'wide',
  source: 'packages/ui/src/mosaic/organization-profile/organization-page.view.tsx',
};

function PlaceholderPanel({ title }: { title: string }) {
  return <h3>{title}</h3>;
}

export function Default() {
  const [activePanel, setActivePanel] = useState<OrganizationProfilePanelId>('general');
  const [name, setName] = useState('Clerk');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const panels: OrganizationPagePanels = {
    general: (
      <OrganizationProfileGeneralPanelView
        name={name}
        slug='clerkorganization-177654156132154'
        onCopySlug={() => undefined}
        onDeleteOrganization={() => undefined}
        onLeaveOrganization={() => undefined}
        onNameChange={setName}
        onUploadLogo={() => undefined}
      />
    ),
    members: (
      <OrganizationProfileMembersPanelView
        members={members}
        pagination={{ page: 1, pageCount: 2, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
        searchValue={memberSearch}
        selectedIds={selectedMemberIds}
        onAcceptRequest={() => undefined}
        onDeclineRequest={() => undefined}
        onFilter={() => undefined}
        onInvite={() => undefined}
        onManageMember={() => undefined}
        onManageRole={() => undefined}
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
        onSearchChange={setMemberSearch}
        onSelectionChange={setSelectedMemberIds}
      />
    ),
    security: <PlaceholderPanel title='Security' />,
    billing: <PlaceholderPanel title='Billing' />,
    'api-keys': <PlaceholderPanel title='API Keys' />,
  };

  return (
    <OrganizationPageView
      activePanel={activePanel}
      panels={panels}
      onPanelChange={setActivePanel}
    />
  );
}
