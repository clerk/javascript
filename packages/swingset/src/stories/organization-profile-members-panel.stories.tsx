import { OrganizationProfileMembersPanelView } from '@clerk/ui/mosaic/organization-profile/organization-profile-members-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { members } from './organization-profile-members-section.stories';

export { default as __source } from './organization-profile-members-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileMembersPanel',
  label: 'Members panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-members-panel.view.tsx',
};

export function Default() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <OrganizationProfileMembersPanelView
      members={members}
      pagination={{ page: 1, pageCount: 2, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
      searchValue={searchValue}
      selectedIds={selectedIds}
      onAcceptRequest={() => undefined}
      onDeclineRequest={() => undefined}
      onFilter={() => undefined}
      onInvite={() => undefined}
      onManageMember={() => undefined}
      onManageRole={() => undefined}
      onPageChange={() => undefined}
      onPageSizeChange={() => undefined}
      onSearchChange={setSearchValue}
      onSelectionChange={setSelectedIds}
    />
  );
}
