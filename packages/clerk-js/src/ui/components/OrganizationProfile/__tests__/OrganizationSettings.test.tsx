import { render, userEvent, waitFor } from '@clerk/shared/testUtils';
import type { OrganizationDomainResource, OrganizationMembershipResource } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { OrganizationSettings } from '../OrganizationSettings';
import { createFakeDomain, createFakeMember } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('OrganizationSettings', () => {
  it('enables organization profile button and disables leave when user is the only admin', async () => {
    const adminsList: OrganizationMembershipResource[] = [createFakeMember({ id: '1', orgId: '1', role: 'admin' })];
    const domainList: OrganizationDomainResource[] = [
      createFakeDomain({ id: '1', organizationId: '1', name: 'clerk.dev' }),
    ];

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve({ data: adminsList, total_count: 1 }));
    fixtures.clerk.organization?.getDomains.mockReturnValue(
      Promise.resolve({
        data: domainList,
        total_count: 1,
      }),
    );
    const { getByText } = render(<OrganizationSettings />, { wrapper });
    await waitFor(() => {
      expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
      expect(getByText('Settings')).toBeDefined();
      expect(getByText('Org1', { exact: false }).closest('button')).not.toBeNull();
      expect(getByText(/leave organization/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
    });
  });

  it('enables organization profile button and enables leave when user is admin and there is more', async () => {
    const adminsList: OrganizationMembershipResource[] = [
      createFakeMember({ id: '1', orgId: '1', role: 'admin' }),
      createFakeMember({ id: '2', orgId: '1', role: 'admin' }),
    ];
    const domainList: OrganizationDomainResource[] = [
      createFakeDomain({ id: '1', organizationId: '1', name: 'clerk.dev' }),
    ];

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve({ data: adminsList, total_count: 2 }));
    fixtures.clerk.organization?.getDomains.mockReturnValue(
      Promise.resolve({
        data: domainList,
        total_count: 1,
      }),
    );
    const { getByText } = render(<OrganizationSettings />, { wrapper });
    await waitFor(() => {
      expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
      expect(getByText('Settings')).toBeDefined();
      expect(getByText('Org1', { exact: false }).closest('button')).not.toBeNull();
      expect(getByText(/leave organization/i, { exact: false }).closest('button')).not.toHaveAttribute('disabled');
    });
  });

  it('disables organization profile button and enables leave when user is not admin', async () => {
    const adminsList: OrganizationMembershipResource[] = [createFakeMember({ id: '1', orgId: '1', role: 'admin' })];

    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve(adminsList));
    const { getByText } = render(<OrganizationSettings />, { wrapper });
    await waitFor(() => {
      expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
      expect(getByText('Settings')).toBeDefined();
      expect(getByText('Org1', { exact: false }).closest('button')).toBeNull();
      expect(getByText(/leave organization/i, { exact: false }).closest('button')).not.toHaveAttribute('disabled');
    });
  });

  describe('Danger section', () => {
    it('always displays danger section and the leave organization button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve([]));
      const { getByText, queryByRole } = render(<OrganizationSettings />, { wrapper });
      await waitFor(() => {
        expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
        expect(getByText('Danger')).toBeDefined();
        expect(getByText(/leave organization/i).closest('button')).toBeInTheDocument();
        expect(queryByRole('button', { name: /delete organization/i })).not.toBeInTheDocument();
      });
    });

    it('enabled leave organization button with delete organization button', async () => {
      const adminsList: OrganizationMembershipResource[] = [
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
      ];

      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin', admin_delete_enabled: true }],
        });
      });

      fixtures.clerk.organization?.getMemberships.mockReturnValue(
        Promise.resolve({ data: adminsList, total_count: 2 }),
      );
      const { getByText } = render(<OrganizationSettings />, { wrapper });
      await waitFor(() => {
        expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
        expect(getByText('Danger')).toBeDefined();
        expect(getByText(/leave organization/i).closest('button')).not.toHaveAttribute('disabled');
        expect(getByText(/delete organization/i).closest('button')).toBeInTheDocument();
      });
    });

    it('disabled leave organization button with delete organization button', async () => {
      const adminsList: OrganizationMembershipResource[] = [
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
      ];

      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin', admin_delete_enabled: true }],
        });
      });

      fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve(adminsList));
      const { getByText, getByRole } = render(<OrganizationSettings />, { wrapper });
      await waitFor(() => {
        expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled();
        expect(getByText('Danger')).toBeDefined();
        expect(getByText(/leave organization/i).closest('button')).toHaveAttribute('disabled');
        expect(getByText(/delete organization/i).closest('button')).toBeInTheDocument();
        expect(getByRole('button', { name: /delete organization/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to Organization Profile edit page when clicking on organization name and user is admin', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(
        Promise.resolve({
          data: [],
          total_count: 0,
        }),
      );
      const { getByText } = render(<OrganizationSettings />, { wrapper });
      await userEvent.click(getByText('Org1', { exact: false }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('profile');
    });

    it('navigates to Leave Organization page when clicking on the respective button and user is not admin', async () => {
      const adminsList: OrganizationMembershipResource[] = [createFakeMember({ id: '1', orgId: '1', role: 'admin' })];

      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.organization?.getMemberships.mockReturnValue(Promise.resolve(adminsList));
      const { findByText } = render(<OrganizationSettings />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalled());
      await userEvent.click(await findByText(/leave organization/i, { exact: false }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('leave');
    });
  });
});
