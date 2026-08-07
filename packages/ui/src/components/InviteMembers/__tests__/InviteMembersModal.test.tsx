import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import { VirtualRouter } from '@/ui/router';

import { clearFetchCache } from '../../../hooks';
import { InviteMembersModal } from '..';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('InviteMembersModal', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  it('renders the invite-members form for a user who can manage memberships', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'admin' }],
      });
    });

    fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { findByText, getByText } = render(
      <VirtualRouter startPath='/inviteMembers'>
        <InviteMembersModal />
      </VirtualRouter>,
      { wrapper },
    );

    await waitFor(async () => expect(await findByText('Invite new members')).toBeInTheDocument());
    getByText('Enter or paste one or more email addresses, separated by spaces or commas.');
  });

  it('renders nothing for a user without the manage-memberships permission', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'member', permissions: [] }],
      });
    });

    const { queryByText } = render(
      <VirtualRouter startPath='/inviteMembers'>
        <InviteMembersModal />
      </VirtualRouter>,
      { wrapper },
    );

    await waitFor(() => expect(queryByText('Invite new members')).not.toBeInTheDocument());
  });
});
