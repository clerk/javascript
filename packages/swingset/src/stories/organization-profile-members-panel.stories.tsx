import { Button } from '@clerk/mosaic/components/button';
import { OrganizationProfileMembersPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel/organization-profile-members-panel.view';
import { space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useInvitationsTableFixture } from './fixtures/invitations-table-tab';
import { useMembersTableFixture } from './fixtures/members-table-tab';
import { useInviteMembersFixture } from './fixtures/organization-profile-invite-members';
import { useRequestsTableFixture } from './fixtures/requests-table-tab';

const styles = stylex.create({
  loadingStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: space['4'],
  },
});

export { default as __source } from './organization-profile-members-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs reverification',
  title: 'OrganizationProfileMembersPanel',
  label: 'Members panel',
  navigation: { category: 'Panels' },
  source:
    'packages/mosaic/src/features/organization-profile/organization-profile-members-panel/organization-profile-members-panel.view.tsx',
};

export function Legacy() {
  const members = useMembersTableFixture();
  const invitations = useInvitationsTableFixture();
  const { onInvite, inviteDialog } = useInviteMembersFixture();
  const requests = useRequestsTableFixture();
  return (
    <OrganizationProfileMembersPanelView
      members={members}
      invitations={invitations}
      requests={requests}
      onInvite={onInvite}
      inviteDialog={inviteDialog}
    />
  );
}

export function Proposed() {
  const members = useMembersTableFixture({ proposed: true });
  const invitations = useInvitationsTableFixture({ proposed: true });
  const { onInvite, inviteDialog } = useInviteMembersFixture();
  const requests = useRequestsTableFixture({ proposed: true });
  return (
    <OrganizationProfileMembersPanelView
      members={members}
      invitations={invitations}
      requests={requests}
      onInvite={onInvite}
      inviteDialog={inviteDialog}
    />
  );
}

export function Empty() {
  const members = useMembersTableFixture({ empty: true });
  const invitations = useInvitationsTableFixture({ empty: true });
  const { onInvite, inviteDialog } = useInviteMembersFixture();
  const requests = useRequestsTableFixture({ empty: true });
  return (
    <OrganizationProfileMembersPanelView
      members={members}
      invitations={invitations}
      requests={requests}
      onInvite={onInvite}
      inviteDialog={inviteDialog}
    />
  );
}

export function Loading() {
  const members = useMembersTableFixture();
  const invitations = useInvitationsTableFixture();
  const { onInvite, inviteDialog } = useInviteMembersFixture();
  const requests = useRequestsTableFixture();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div {...stylex.props(styles.loadingStack)}>
      <div>
        <Button
          color='neutral'
          size='sm'
          variant='outline'
          disabled={loading}
          onClick={() => setLoading(true)}
        >
          Reload
        </Button>
      </div>
      <OrganizationProfileMembersPanelView
        members={{ ...members, isLoading: loading }}
        invitations={{ ...invitations, isLoading: loading }}
        requests={{ ...requests, isLoading: loading }}
        onInvite={onInvite}
        inviteDialog={inviteDialog}
      />
    </div>
  );
}
