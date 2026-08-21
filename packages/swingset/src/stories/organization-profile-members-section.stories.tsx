import type { OrganizationProfileMember } from '@clerk/ui/mosaic/organization-profile/organization-profile-members-section.view';
import { OrganizationProfileMembersSectionView } from '@clerk/ui/mosaic/organization-profile/organization-profile-members-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-members-section.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileMembersSection',
  label: 'Members collection',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-members-section.view.tsx',
};

export const members: OrganizationProfileMember[] = [
  {
    id: 'request',
    name: 'Preston Booth',
    emailAddress: 'preston@clerk.dev',
    status: 'request',
    initials: 'PB',
  },
  {
    id: 'invited',
    name: 'Bertram Gilfoyle',
    emailAddress: 'gilfoyle@clerk.dev',
    status: 'invited',
    addedAtLabel: '5/11/26',
    initials: 'BG',
    roleLabel: 'Member',
  },
  ...Array.from(
    { length: 7 },
    (_, index): OrganizationProfileMember => ({
      id: `member-${index + 1}`,
      name: 'Preston Booth',
      emailAddress: 'preston@clerk.dev',
      status: 'active',
      addedAtLabel: '5/11/26',
      initials: 'PB',
      roleLabel: 'Member',
    }),
  ),
];

export function Default() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <OrganizationProfileMembersSectionView
      members={members}
      pagination={{ page: 1, pageCount: 2, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
      selectedIds={selectedIds}
      onAcceptRequest={() => undefined}
      onDeclineRequest={() => undefined}
      onManageMember={() => undefined}
      onManageRole={() => undefined}
      onPageChange={() => undefined}
      onPageSizeChange={() => undefined}
      onSelectionChange={setSelectedIds}
    />
  );
}

export function Empty() {
  return (
    <OrganizationProfileMembersSectionView
      members={[]}
      selectedIds={[]}
      onSelectionChange={() => undefined}
    />
  );
}
