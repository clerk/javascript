import type { ClerkPaginatedResponse, OrganizationDomainResource, OrganizationMembershipResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import userEvent from '@testing-library/user-event';

import { act, render, waitFor } from '../../../../testUtils';
import { CardStateProvider } from '../../../elements';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { OrganizationGeneralPage } from '../OrganizationGeneralPage';
import { createFakeDomain, createFakeMember } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('OrganizationSettings', () => {
  it.skip('enables organization profile button and disables leave when user is the only admin', async () => {
    const adminsList: OrganizationMembershipResource[] = [createFakeMember({ id: '1', orgId: '1', role: 'admin' })];
    const domainList: OrganizationDomainResource[] = [
      createFakeDomain({ id: '1', organizationId: '1', name: 'clerk.com' }),
    ];

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1' }] });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve({ data: adminsList, total_count: 1 }));
    fixtures.clerk.organization?.getDomains.mockReturnValue(
      Promise.resolve({
        data: domainList,
        total_count: 1,
      }),
    );

    const { getByText } = render(<OrganizationGeneralPage />, { wrapper });

    await waitFor(() => {
      expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
    });

    expect(getByText('General')).toBeDefined();
    expect(getByText('Org1', { exact: false }).closest('button')).not.toBeNull();
    expect(getByText(/leave organization/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
  });

  it('enables organization profile button when user has permissions', async () => {
    const domainList: OrganizationDomainResource[] = [
      createFakeDomain({ id: '1', organizationId: '1', name: 'clerk.com' }),
    ];

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1' }] });
    });

    fixtures.clerk.organization?.getDomains.mockReturnValue(
      Promise.resolve({
        data: domainList,
        total_count: 1,
      }),
    );
    const { getByText, getByRole } = render(<OrganizationGeneralPage />, { wrapper });
    await waitFor(() => {
      expect(getByText('General')).toBeDefined();
      getByRole('button', { name: /update profile/i });
      expect(getByRole('button', { name: /leave organization/i })).not.toBeDisabled();
    });
  });

  it('disabled organization profile button when user does not have permissions', async () => {
    const domainList: OrganizationDomainResource[] = [
      createFakeDomain({ id: '1', organizationId: '1', name: 'clerk.com' }),
    ];

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', permissions: [] }],
      });
    });

    fixtures.clerk.organization?.getDomains.mockReturnValue(
      Promise.resolve({
        data: domainList,
        total_count: 1,
      }),
    );
    const { getByText, queryByRole } = render(<OrganizationGeneralPage />, { wrapper });
    await waitFor(() => {
      expect(getByText('General')).toBeDefined();
      expect(queryByRole('button', { name: /update profile/i })).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /leave organization/i })).not.toBeDisabled();
    });
  });

  it.skip('disables organization profile button and enables leave when user is not admin', async () => {
    const adminsList: ClerkPaginatedResponse<OrganizationMembershipResource> = {
      data: [createFakeMember({ id: '1', orgId: '1', role: 'admin' })],
      total_count: 1,
    };

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve(adminsList));
    const { getByText } = render(<OrganizationGeneralPage />, { wrapper });
    await waitFor(() => {
      expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
      expect(getByText('General')).toBeDefined();
      expect(getByText('Org1', { exact: false }).closest('button')).toBeNull();
      expect(getByText(/leave organization/i, { exact: false }).closest('button')).not.toHaveAttribute('disabled');
    });
  });

  it('hides domains when `read` permission is missing', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationDomains();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', permissions: ['org:sys_memberships:read'] }],
      });
    });
    const { queryByText } = await act(() => render(<OrganizationGeneralPage />, { wrapper }));
    await new Promise(r => setTimeout(r, 100));
    expect(queryByText('Verified domains')).not.toBeInTheDocument();
    expect(fixtures.clerk.organization?.getDomains).not.toBeCalled();
  });

  it('shows domains when `read` permission exists but hides the Add domain button', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationDomains();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', permissions: ['org:sys_domains:read'] }],
      });
    });
    fixtures.clerk.organization?.getDomains.mockReturnValue(
      Promise.resolve({
        data: [],
        total_count: 0,
      }),
    );
    const { queryByText } = await act(() => render(<OrganizationGeneralPage />, { wrapper }));

    await new Promise(r => setTimeout(r, 100));
    expect(queryByText('Verified domains')).toBeInTheDocument();
    expect(queryByText('Add domain')).not.toBeInTheDocument();
    expect(fixtures.clerk.organization?.getDomains).toBeCalled();
  });

  it('shows domains and shows the Add domain button when `org:sys_domains:manage` exists', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationDomains();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', permissions: ['org:sys_domains:read', 'org:sys_domains:manage'] }],
      });
    });
    fixtures.clerk.organization?.getDomains.mockReturnValue(
      Promise.resolve({
        data: [],
        total_count: 0,
      }),
    );
    const { queryByText } = await act(() => render(<OrganizationGeneralPage />, { wrapper }));

    await new Promise(r => setTimeout(r, 100));
    expect(queryByText('Verified domains')).toBeInTheDocument();
    expect(queryByText('Add domain')).toBeInTheDocument();
    expect(fixtures.clerk.organization?.getDomains).toBeCalled();
  });

  describe('Danger section', () => {
    it('always displays danger section and the leave organization button', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      const { queryByRole } = await act(() => render(<OrganizationGeneralPage />, { wrapper }));
      await waitFor(() => {
        expect(queryByRole('button', { name: /leave organization/i })).toBeInTheDocument();
        expect(queryByRole('button', { name: /delete organization/i })).not.toBeInTheDocument();
      });
    });

    it('enabled leave organization button with delete organization button', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', admin_delete_enabled: true }],
        });
      });

      const { getByRole } = render(<OrganizationGeneralPage />, { wrapper });
      await waitFor(() => {
        expect(getByRole('button', { name: /leave organization/i })).not.toHaveAttribute('disabled');
        expect(getByRole('button', { name: /delete organization/i })).toBeInTheDocument();
      });
    });

    it.skip('disabled leave organization button with delete organization button', async () => {
      const adminsList: ClerkPaginatedResponse<OrganizationMembershipResource> = {
        data: [
          createFakeMember({
            id: '1',
            orgId: '1',
            role: 'admin',
          }),
          createFakeMember({
            id: '2',
            orgId: '1',
            role: 'admin',
          }),
        ],
        total_count: 2,
      };

      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', admin_delete_enabled: true }],
        });
      });

      fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve(adminsList));
      const { getByRole } = render(<OrganizationGeneralPage />, { wrapper });
      await waitFor(() => {
        expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
        expect(getByRole('button', { name: /leave organization/i })).toHaveAttribute('disabled');
        expect(getByRole('button', { name: /delete organization/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('open the profile section', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', slug: 'Org1' }],
        });
      });

      const { getByText, getByLabelText, getByRole, userEvent, queryByText, queryByLabelText } = render(
        <OrganizationGeneralPage />,
        {
          wrapper,
        },
      );
      getByText('Org1');
      await userEvent.click(getByRole('button', { name: /update profile/i }));
      await waitFor(() => getByLabelText(/name/i));
      expect(queryByText('Logo')).toBeInTheDocument();
      expect(queryByLabelText(/name/i)).toBeInTheDocument();
      expect(queryByLabelText(/slug/i)).toBeInTheDocument();
      expect(getByRole('button', { name: /upload/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /save/i })).toBeDisabled();
    });
  });

  describe('Leave organization', () => {
    // TODO(@panteliselef): Update this test to allow user to leave an org, only if there will be at least one person left with the minimum set of permissions
    // ^ This require FAPI changes
    it('shows Leave Organization screen when clicking on the respective button', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: [] }],
        });
      });

      const { findByRole, getByRole, getByText } = render(
        <CardStateProvider>
          <OrganizationGeneralPage />
        </CardStateProvider>,
        { wrapper },
      );

      await waitFor(async () =>
        expect(await findByRole('button', { name: /leave organization/i })).toBeInTheDocument(),
      );
      await userEvent.click(getByRole('button', { name: /leave organization/i }));

      await waitFor(async () =>
        expect(await findByRole('heading', { name: /leave organization/i })).toBeInTheDocument(),
      );
      getByText(/Are you sure you want to leave this organization/i);
      getByText(/This action is permanent and irreversible/i);
    });

    it('hides Leave Organization screen when clicking cancel', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: [] }],
        });
      });

      const { findByRole, getByRole, queryByRole } = render(
        <CardStateProvider>
          <OrganizationGeneralPage />
        </CardStateProvider>,
        { wrapper },
      );

      await waitFor(async () =>
        expect(await findByRole('button', { name: /leave organization/i })).toBeInTheDocument(),
      );
      await userEvent.click(getByRole('button', { name: /leave organization/i }));
      await waitFor(async () =>
        expect(await findByRole('heading', { name: /leave organization/i })).toBeInTheDocument(),
      );
      await userEvent.click(getByRole('button', { name: /cancel/i }));
      await waitFor(async () =>
        expect(await findByRole('button', { name: /leave organization/i })).toBeInTheDocument(),
      );
      expect(queryByRole('heading', { name: /leave organization/i })).not.toBeInTheDocument();
    });
  });
});
