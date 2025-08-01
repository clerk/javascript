import { describe } from '@jest/globals';
import userEvent from '@testing-library/user-event';

import { bindCreateFixtures, render, waitFor } from '@/testUtils';
import { createFakeUserOrganizationMembership } from '@/ui/components/OrganizationSwitcher/__tests__/utlis';

import { TaskSelectOrganization } from '../';

const { createFixtures } = bindCreateFixtures('TaskSelectOrganization');

describe('TaskSelectOrganization', () => {
  it('does not render component without existing session task', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
      });
    });

    const { queryByText, queryByRole } = render(<TaskSelectOrganization />, { wrapper });

    await waitFor(() => {
      expect(queryByText('Setup your account')).not.toBeInTheDocument();
      expect(queryByText('Tell us a bit about your organization')).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });
  });

  it('renders component when session task exists', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'select-organization' }],
      });
    });

    const { getByText, getByRole } = render(<TaskSelectOrganization />, { wrapper });

    await waitFor(() => {
      expect(getByText('Setup your account')).toBeInTheDocument();
      expect(getByText('Tell us a bit about your organization')).toBeInTheDocument();
      expect(getByRole('link', { name: /sign out/i })).toBeInTheDocument();
    });
  });

  it('shows create organization screen when user has no existing resources', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'select-organization' }],
      });
    });

    const { getByRole, getByText } = render(<TaskSelectOrganization />, { wrapper });

    await waitFor(() => {
      expect(getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(getByText('Create organization')).toBeInTheDocument();
    });
  });

  it('shows select organization screen when user has existing organizations', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'select-organization' }],
      });
    });

    fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [
          createFakeUserOrganizationMembership({
            id: '1',
            organization: {
              id: '1',
              name: 'Existing Org',
              slug: 'org1',
              membersCount: 1,
              adminDeleteEnabled: false,
              maxAllowedMemberships: 1,
              pendingInvitationsCount: 1,
            },
          }),
        ],
        total_count: 1,
      }),
    );

    const { getByText, queryByRole } = render(<TaskSelectOrganization />, { wrapper });

    await waitFor(() => {
      expect(getByText('Existing Org')).toBeInTheDocument();
      expect(getByText('Create organization')).toBeInTheDocument();
      expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });
  });

  it('allows switching between select and create organization screens', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'select-organization' }],
      });
    });

    fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [
          createFakeUserOrganizationMembership({
            id: '1',
            organization: {
              id: '1',
              name: 'Existing Org',
              slug: 'org1',
              membersCount: 1,
              adminDeleteEnabled: false,
              maxAllowedMemberships: 1,
              pendingInvitationsCount: 1,
            },
          }),
        ],
        total_count: 1,
      }),
    );

    const { getByText, getByRole, queryByRole, queryByText } = render(<TaskSelectOrganization />, { wrapper });

    await waitFor(() => {
      expect(getByText('Existing Org')).toBeInTheDocument();
      expect(getByText('Create organization')).toBeInTheDocument();
      expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });

    const createButton = getByText('Create organization');
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /create organization/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(queryByText('Existing Org')).not.toBeInTheDocument();
    });

    const cancelButton = getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(getByText('Existing Org')).toBeInTheDocument();
      expect(getByText('Create organization')).toBeInTheDocument();
      expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });
  });

  it('displays user identifier in sign out section', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['user@test.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'select-organization' }],
      });
    });

    const { getByText } = render(<TaskSelectOrganization />, { wrapper });

    await waitFor(() => {
      expect(getByText(/user@test\.com/)).toBeInTheDocument();
      expect(getByText('Sign out')).toBeInTheDocument();
    });
  });

  it('handles sign out correctly', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'select-organization' }],
      });
    });

    const { getByRole } = render(<TaskSelectOrganization />, { wrapper });
    const signOutButton = getByRole('link', { name: /sign out/i });

    await userEvent.click(signOutButton);

    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });

  it('renders with username when email is not available', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        username: 'testuser',
        create_organization_enabled: true,
        tasks: [{ key: 'select-organization' }],
      });
    });

    const { getByText } = render(<TaskSelectOrganization />, { wrapper });

    expect(getByText(/testuser/)).toBeInTheDocument();
  });
});
