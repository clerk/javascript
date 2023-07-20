import { render, userEvent, waitFor } from '@clerk/shared/testUtils';
import type { OrganizationMembershipResource } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { OrganizationMembers } from '../OrganizationMembers';
import { createFakeMember } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('OrganizationMembers', () => {
  it('renders the Organization Members page', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: ['Org1'] });
    });

    const { getByText } = render(<OrganizationMembers />, { wrapper });

    await waitFor(() => {
      expect(getByText('Members')).toBeDefined();
      expect(getByText('View and manage organization members')).toBeDefined();
    });
  });

  it('shows an invite button and invited tab if the current user is an admin', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    const { getByText, getByRole } = render(<OrganizationMembers />, { wrapper });

    await waitFor(() => {
      expect(getByText('Invited')).toBeDefined();
      expect(getByRole('button', { name: 'Invite' })).toBeDefined();
    });
  });

  it('does not show an invite button and invited tab if the current user is not an admin', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    const { queryByRole, queryByText } = render(<OrganizationMembers />, { wrapper });

    await waitFor(() => {
      expect(queryByText('Invited')).toBeNull();
      expect(queryByRole('button', { name: 'Invite' })).toBeNull();
    });
  });

  it('navigates to invite screen when user clicks on Invite button', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    const { getByRole } = render(<OrganizationMembers />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Invite' }));

    await waitFor(() => {
      expect(fixtures.router.navigate).toHaveBeenCalledWith('invite-members');
    });
  });

  it('lists all the members of the Organization', async () => {
    const membersList: OrganizationMembershipResource[] = [
      createFakeMember({
        id: '1',
        orgId: '1',
        role: 'admin',
        identifier: 'test_user1',
        firstName: 'First1',
        lastName: 'Last1',
        createdAt: new Date('2022-01-01'),
      }),
      createFakeMember({
        id: '2',
        orgId: '1',
        role: 'basic_member',
        identifier: 'test_user2',
        firstName: 'First2',
        lastName: 'Last2',
        createdAt: new Date('2022-01-01'),
      }),
    ];
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', id: '1', role: 'admin' }],
      });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve(membersList));
    const { findByText } = render(<OrganizationMembers />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled());
    expect(await findByText('test_user1')).toBeDefined();
    expect(await findByText('First1 Last1')).toBeDefined();
    expect(await findByText('Admin')).toBeDefined();
    expect(await findByText('test_user2')).toBeDefined();
    expect(await findByText('First2 Last2')).toBeDefined();
    expect(await findByText('Member')).toBeDefined();
  });

  it.todo('removes member from organization when clicking the respective button on a user row');
  it.todo('changes role on a member from organization when clicking the respective button on a user row');
  it.todo('changes tab and renders the pending invites list');

  it('shows the "You" badge when the member id from the list matches the current session user id', async () => {
    const membersList: OrganizationMembershipResource[] = [
      createFakeMember({ id: '1', orgId: '1', role: 'admin', identifier: 'test_user1' }),
      createFakeMember({ id: '2', orgId: '1', role: 'basic_member', identifier: 'test_user2' }),
    ];
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        id: '1',
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', id: '1', role: 'admin' }],
      });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve(membersList));
    const { findByText } = render(<OrganizationMembers />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled());
    expect(await findByText('You')).toBeDefined();
  });
});
