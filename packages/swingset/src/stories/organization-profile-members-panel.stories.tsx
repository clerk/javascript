import { OrganizationProfileMembersPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel.view';

import type { StoryMeta } from '@/lib/types';

import { useInvitationsTableFixture } from './fixtures/invitations-table-tab';
import { useMembersTableFixture } from './fixtures/members-table-tab';
import { useRequestsTableFixture } from './fixtures/requests-table-tab';

export { default as __source } from './organization-profile-members-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileMembersPanel',
  label: 'Members panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-members-panel.view.tsx',
};

export function Legacy() {
  const members = useMembersTableFixture();
  const invitations = useInvitationsTableFixture();
  const requests = useRequestsTableFixture();
  return (
    <OrganizationProfileMembersPanelView
      members={members}
      invitations={invitations}
      requests={requests}
    />
  );
}

export function Proposed() {
  const members = useMembersTableFixture({ proposed: true });
  const invitations = useInvitationsTableFixture({ proposed: true });
  const requests = useRequestsTableFixture({ proposed: true });
  return (
    <OrganizationProfileMembersPanelView
      members={members}
      invitations={invitations}
      requests={requests}
    />
  );
}

export function Empty() {
  const members = useMembersTableFixture({ empty: true });
  const invitations = useInvitationsTableFixture({ empty: true });
  const requests = useRequestsTableFixture({ empty: true });
  return (
    <OrganizationProfileMembersPanelView
      members={members}
      invitations={invitations}
      requests={requests}
    />
  );
}
