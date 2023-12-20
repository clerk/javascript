import type { OrganizationInvitationResource, OrganizationMembershipResource } from '@clerk/types';
import { describe } from '@jest/globals';
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { OrganizationMembers } from '../OrganizationMembers';
import { createFakeMember, createFakeOrganizationInvitation, createFakeOrganizationMembershipRequest } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

async function waitForLoadingCompleted(container: HTMLElement) {
  return waitForElementToBeRemoved(() => container.querySelector('span[aria-busy="true"]'));
}

describe('OrganizationMembers', () => {
  it('renders the Organization Members page', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1'] });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);
    const { container, getByRole } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);

    expect(getByRole('heading', { name: /members/i })).toBeInTheDocument();

    // Tabs
    expect(getByRole('tab', { name: 'Members' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Invitations' })).toBeInTheDocument();
  });

  it('shows requests if domains is turned on', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationDomains();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1'] });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { getByRole, container } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);

    expect(getByRole('tab', { name: 'Requests' })).toBeInTheDocument();
  });

  it('shows an invite button inside invitations tab if the current user is an admin', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { getByRole, findByText } = render(<OrganizationMembers />, { wrapper });

    await userEvent.click(getByRole('tab', { name: 'Invitations' }));
    expect(await findByText('Invited')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Invite' })).toBeInTheDocument();
  });

  it('does not show invitations and requests if user is not an admin', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', permissions: ['org:sys_memberships:read'] }],
      });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { container, queryByRole } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);

    expect(queryByRole('tab', { name: 'Members' })).toBeInTheDocument();
    expect(queryByRole('tab', { name: 'Invitations' })).not.toBeInTheDocument();
    expect(queryByRole('tab', { name: 'Requests' })).not.toBeInTheDocument();
  });

  it('does not show members tab or navbar route if user is lacking permissions', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', permissions: [] }],
      });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { queryByRole } = render(<OrganizationMembers />, { wrapper });

    expect(queryByRole('tab', { name: 'Members' })).not.toBeInTheDocument();
    expect(queryByRole('tab', { name: 'Invitations' })).not.toBeInTheDocument();
    expect(queryByRole('tab', { name: 'Requests' })).not.toBeInTheDocument();
  });

  it('shows the invite screen when user clicks on Invite button', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { container, getByRole } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);

    await userEvent.click(getByRole('tab', { name: 'Invitations' }));
    await userEvent.click(getByRole('button', { name: 'Invite' }));

    await waitFor(() => {
      screen.getByRole('heading', { name: /invite members/i });
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
        role: 'member',
        identifier: 'test_user2',
        firstName: 'First2',
        lastName: 'Last2',
        createdAt: new Date('2022-01-01'),
      }),
      createFakeMember({
        id: '3',
        orgId: '1',
        role: 'admin',
        identifier: 'test_user3',
        firstName: 'First3',
        lastName: 'Last3',
        createdAt: new Date('2022-01-01'),
      }),
    ];
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', id: '1' }],
      });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: membersList,
        total_count: 2,
      }),
    );

    fixtures.clerk.organization?.getMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [],
        total_count: 2,
      }),
    );

    fixtures.clerk.organization?.getRoles.mockResolvedValue({
      total_count: 2,
      data: [
        {
          pathRoot: '',
          reload: jest.fn(),
          id: 'member',
          key: 'member',
          name: 'Member',
          description: '',
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          pathRoot: '',
          reload: jest.fn(),
          id: 'admin',
          key: 'admin',
          name: 'Admin',
          description: '',
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    const { container, queryByText, queryAllByRole } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);

    expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
    expect(fixtures.clerk.organization?.getInvitations).not.toHaveBeenCalled();
    expect(fixtures.clerk.organization?.getMembershipRequests).not.toHaveBeenCalled();

    expect(queryByText('test_user1')).toBeInTheDocument();
    expect(queryByText('First1 Last1')).toBeInTheDocument();

    const buttons = queryAllByRole('button', { name: 'Admin' });
    buttons.forEach(button => expect(button).not.toBeDisabled());

    expect(queryByText('test_user2')).toBeInTheDocument();
    expect(queryByText('First2 Last2')).toBeInTheDocument();
    expect(queryByText('Member')).toBeInTheDocument();
  });

  it('display pagination counts for 2 pages', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', id: '1' }],
      });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [],
        total_count: 14,
      }),
    );

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { container, getByText } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);

    expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
    expect(fixtures.clerk.organization?.getInvitations).not.toHaveBeenCalled();
    expect(fixtures.clerk.organization?.getMembershipRequests).not.toHaveBeenCalled();

    // TODO-RETHEME fix
    // await userEvent.click(getByText(/next/i));

    await waitFor(async () => {
      const pagination = getByText(/displaying/i).closest('p');
      expect(pagination?.textContent).toEqual('Displaying 11 – 14 of 14');
    });
  });

  it('display pagination counts for 1 page', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', id: '1' }],
      });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [],
        total_count: 5,
      }),
    );

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { container, getByText } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);

    const pagination = getByText(/displaying/i).closest('p');
    expect(pagination?.textContent).toEqual('Displaying 1 – 5 of 5');

    // TODO-RETHEME fix
    // expect(getByText(/next/i)).toBeDisabled();
  });

  // TODO: Bring this test back once we can determine the last admin by permissions.
  it.skip('Last admin cannot change to member', async () => {
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
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', id: '1' }],
      });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValueOnce(
      Promise.resolve({ data: membersList, total_count: 0 }),
    );

    fixtures.clerk.organization?.getMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [],
        total_count: 0,
      }),
    );

    const { queryByRole } = render(<OrganizationMembers />, { wrapper });

    await waitFor(() => {
      expect(queryByRole('button', { name: 'Admin' })).toBeDisabled();
    });
  });

  it('displays counter in requests tab', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationDomains();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', id: '1' }],
      });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);
    fixtures.clerk.organization?.getMembershipRequests.mockReturnValue(
      Promise.resolve({
        data: [],
        total_count: 2,
      }),
    );

    const { findByText } = render(<OrganizationMembers />, { wrapper });
    expect(await findByText('2')).toBeInTheDocument();
  });

  it.todo('removes member from organization when clicking the respective button on a user row');
  it.todo('changes role on a member from organization when clicking the respective button on a user row');
  it('changes tab and renders the pending invites list', async () => {
    const invitationList: OrganizationInvitationResource[] = [
      createFakeOrganizationInvitation({
        id: '1',
        role: 'admin',
        emailAddress: 'admin1@clerk.com',
        organizationId: '1',
        createdAt: new Date('2022-01-01'),
      }),
      createFakeOrganizationInvitation({
        id: '2',
        role: 'basic_member',
        emailAddress: 'member2@clerk.com',
        organizationId: '1',
        createdAt: new Date('2022-01-01'),
      }),
    ];
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', id: '1' }],
      });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    fixtures.clerk.organization?.getInvitations.mockReturnValue(
      Promise.resolve({
        data: invitationList,
        total_count: 2,
      }),
    );

    const { container, getByRole, getByText, findByText } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);
    await userEvent.click(getByRole('tab', { name: 'Invitations' }));

    expect(await findByText('admin1@clerk.com')).toBeInTheDocument();
    expect(getByText('Admin')).toBeInTheDocument();
    expect(getByText('member2@clerk.com')).toBeInTheDocument();
    expect(getByText('Member')).toBeInTheDocument();
    expect(fixtures.clerk.organization?.getInvitations).toHaveBeenCalled();
  });

  it('changes tab and renders pending requests', async () => {
    const requests = {
      data: [
        createFakeOrganizationMembershipRequest({
          id: '1',
          publicUserData: {
            userId: '1',
            identifier: 'admin1@clerk.com',
          },
          organizationId: '1',
          createdAt: new Date('2022-01-01'),
        }),
        createFakeOrganizationMembershipRequest({
          id: '2',
          publicUserData: {
            userId: '1',
            identifier: 'member2@clerk.com',
          },
          organizationId: '1',
          createdAt: new Date('2022-01-01'),
        }),
      ],
      total_count: 4,
    };
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationDomains();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', id: '1' }],
      });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    fixtures.clerk.organization?.getDomains.mockReturnValue(
      Promise.resolve({
        data: [],
        total_count: 0,
      }),
    );
    fixtures.clerk.organization?.getMembershipRequests.mockReturnValue(Promise.resolve(requests));
    const { queryByText, getByRole } = render(<OrganizationMembers />, { wrapper });

    await waitFor(async () => {
      await userEvent.click(getByRole('tab', { name: 'Requests' }));
    });

    expect(fixtures.clerk.organization?.getMembershipRequests).toHaveBeenCalledWith({
      initialPage: 1,
      pageSize: 10,
      status: 'pending',
    });

    expect(queryByText('admin1@clerk.com')).toBeInTheDocument();
    expect(queryByText('member2@clerk.com')).toBeInTheDocument();
  });

  it('shows the "You" badge when the member id from the list matches the current session user id', async () => {
    const membersList: OrganizationMembershipResource[] = [
      createFakeMember({ id: '1', orgId: '1', role: 'admin', identifier: 'test_user1' }),
      createFakeMember({ id: '2', orgId: '1', role: 'basic_member', identifier: 'test_user2' }),
    ];
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        id: '1',
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', id: '1' }],
      });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);
    fixtures.clerk.organization?.getMemberships.mockReturnValue(
      Promise.resolve({
        data: membersList,
        total_count: 2,
      }),
    );

    const { container, getByText } = render(<OrganizationMembers />, { wrapper });

    await waitForLoadingCompleted(container);

    expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
    expect(getByText('You')).toBeInTheDocument();
  });
});
