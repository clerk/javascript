/** @jsxImportSource @emotion/react */
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import type { MemberRow } from '@clerk/ui/mosaic/organization/organization-profile-members-panel.controller';
import { organizationProfileMembersPanelMachine } from '@clerk/ui/mosaic/organization/organization-profile-members-panel.machine';
import { OrganizationProfileMembersPanelView } from '@clerk/ui/mosaic/organization/organization-profile-members-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfileMembersPanel',
  source: 'packages/ui/src/mosaic/organization/organization-profile-members-panel.tsx',
};

const DEMO_MEMBERS: Omit<MemberRow, 'onRemove'>[] = [
  {
    id: 'mem_1',
    name: 'Ada Lovelace',
    identifier: 'ada@example.com',
    roleLabel: 'Admin',
    joinedAt: '1/12/2024',
    isCurrentUser: true,
    isBanned: false,
  },
  {
    id: 'mem_2',
    name: 'Alan Turing',
    identifier: 'alan@example.com',
    roleLabel: 'Member',
    joinedAt: '3/4/2024',
    isCurrentUser: false,
    isBanned: false,
  },
  {
    id: 'mem_3',
    name: 'Grace Hopper',
    identifier: 'grace@example.com',
    roleLabel: 'Member',
    joinedAt: '6/9/2024',
    isCurrentUser: false,
    isBanned: true,
  },
];

export function Default() {
  const [snapshot, send] = useMachine(organizationProfileMembersPanelMachine);
  const [page, setPage] = useState(1);

  const rows: MemberRow[] = DEMO_MEMBERS.map(member => ({
    ...member,
    onRemove: () =>
      send({
        type: 'REMOVE_MEMBER',
        membershipId: member.id,
        // Simulate the network round-trip so the row shows its "Removing…" state.
        run: () => new Promise<void>(resolve => setTimeout(resolve, 700)),
      }),
  }));

  return (
    <OrganizationProfileMembersPanelView
      snapshot={snapshot}
      send={send}
      rows={rows}
      canManage
      page={page}
      pageCount={3}
      isLoading={false}
      onPageChange={setPage}
    />
  );
}
